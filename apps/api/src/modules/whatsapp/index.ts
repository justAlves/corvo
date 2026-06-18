import { and, asc, desc, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

import { drizzle } from "../../config/db";
import { env } from "../../config/env";
import {
  conversation,
  conversationStatuses,
} from "../../shared/tables/conversation.table";
import { message } from "../../shared/tables/message.table";
import { whatsappInstance } from "../../shared/tables/whatsapp-instance.table";
import { AuthGuard } from "../auth";
import {
  EvolutionApiError,
  evolution,
  type EvolutionState,
} from "./evolution-client";
import {
  parseMessagesUpsert,
  processInboundMessage,
  setConversationStatus,
} from "./inbound";

const WEBHOOK_EVENTS = [
  "CONNECTION_UPDATE",
  "QRCODE_UPDATED",
  "MESSAGES_UPSERT",
] as const;

function slugForUser(userId: string) {
  return `krewo-${userId.slice(0, 16)}`.toLowerCase();
}

function resolveHash(hash: string | { apikey?: string } | undefined): string {
  if (!hash) return "";
  if (typeof hash === "string") return hash;
  return hash.apikey ?? "";
}

function mapEvolutionState(state?: EvolutionState | string | null) {
  switch (state) {
    case "open":
      return "connected" as const;
    case "connecting":
      return "connecting" as const;
    case "close":
      return "disconnected" as const;
    default:
      return "pending" as const;
  }
}

function normalizeEvent(raw: string | undefined) {
  return (raw ?? "").toUpperCase().replace(/\./g, "_");
}

async function ensureWebhook(instanceName: string, apiKey: string) {
  try {
    await evolution.setWebhook(
      instanceName,
      {
        url: `${env.PUBLIC_WEBHOOK_URL}/whatsapp/webhook`,
        events: [...WEBHOOK_EVENTS],
        enabled: true,
        byEvents: false,
        base64: false,
      },
      apiKey,
    );
    console.log(
      "[whatsapp] webhook ensured",
      JSON.stringify({
        instanceName,
        url: `${env.PUBLIC_WEBHOOK_URL}/whatsapp/webhook`,
        events: [...WEBHOOK_EVENTS],
      }),
    );
  } catch (err) {
    console.error(
      "[whatsapp] ensureWebhook failed",
      JSON.stringify({
        instanceName,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    throw err;
  }
}

async function harvestInitialQr(instanceName: string, apiKey: string) {
  for (let i = 0; i < 6; i += 1) {
    try {
      const res = await evolution.connect(instanceName, apiKey);
      if (res.base64) {
        return {
          qrCode: res.base64,
          pairingCode: res.pairingCode ?? null,
        };
      }
    } catch (err) {
      console.warn(
        `[whatsapp] connect attempt ${i + 1} failed for ${instanceName}:`,
        err instanceof Error ? err.message : err,
      );
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return { qrCode: null, pairingCode: null };
}

export const WhatsappModule = new Elysia({
  name: "whatsapp",
  prefix: "/whatsapp",
})

  .post(
    "/webhook",
    async ({ body, set }) => {
      const payload = (body ?? {}) as {
        event?: string;
        instance?: string;
        data?: Record<string, unknown>;
      };
      console.log(
        "[whatsapp:webhook] payload",
        JSON.stringify({
          event: payload.event,
          instance: payload.instance,
          dataKeys: payload.data ? Object.keys(payload.data) : [],
        }),
      );
      if (process.env.WHATSAPP_DEBUG === "1") {
        const raw = JSON.stringify(payload);
        console.log(
          "[whatsapp:webhook] raw",
          raw.length > 4000 ? `${raw.slice(0, 4000)}…[truncated]` : raw,
        );
      }
      const event = normalizeEvent(payload.event);
      const instance = payload.instance;

      if (!instance || !event) {
        console.warn(
          "[whatsapp:webhook] dropped — missing event/instance",
          JSON.stringify({ event, instance }),
        );
        set.status = 204;
        return null;
      }

      const [row] = await drizzle
        .select()
        .from(whatsappInstance)
        .where(eq(whatsappInstance.instanceName, instance))
        .limit(1);
      if (!row) {
        console.warn(
          "[whatsapp:webhook] unknown instance",
          JSON.stringify({ event, instance }),
        );
        set.status = 204;
        return null;
      }

      console.log(
        "[whatsapp:webhook] received",
        JSON.stringify({
          event,
          instance,
          rowId: row.id,
          status: row.status,
        }),
      );

      if (event === "QRCODE_UPDATED") {
        const data = payload.data ?? {};
        const qrcode = (data.qrcode as Record<string, unknown> | undefined) ?? data;
        const base64 = (qrcode?.base64 as string | undefined) ?? null;
        const pairingCode =
          (qrcode?.pairingCode as string | undefined) ??
          (data.pairingCode as string | undefined) ??
          null;
        if (base64) {
          await drizzle
            .update(whatsappInstance)
            .set({
              qrCode: base64,
              pairingCode,
              status: row.status === "connected" ? row.status : "connecting",
            })
            .where(eq(whatsappInstance.id, row.id));
        }
      } else if (event === "MESSAGES_UPSERT") {
        const dump = JSON.stringify(payload.data ?? {}, null, 2);
        console.log(
          "[whatsapp:webhook] MESSAGES_UPSERT data",
          dump.length > 8000 ? `${dump.slice(0, 8000)}\n…[truncated]` : dump,
        );
        if (process.env.WHATSAPP_DUMP_ONLY === "1") {
          console.log("[whatsapp:webhook] dump-only mode — skipping AI reply");
        } else {
          const envelopes = parseMessagesUpsert(payload.data);
          for (const envelope of envelopes) {
            processInboundMessage(row, envelope).catch((err) => {
              console.error("[whatsapp] inbound processing failed", err);
            });
          }
        }
      } else if (event === "CONNECTION_UPDATE") {
        const state = (payload.data?.state as EvolutionState | undefined) ?? null;
        const status = mapEvolutionState(state);
        const wuid = (payload.data?.wuid as string | undefined) ?? null;
        const phone = wuid ? wuid.split("@")[0] : null;
        const profileName =
          (payload.data?.profileName as string | undefined) ?? null;
        const profilePictureUrl =
          (payload.data?.profilePictureUrl as string | undefined) ?? null;

        await drizzle
          .update(whatsappInstance)
          .set({
            status,
            phoneNumber: phone ?? row.phoneNumber,
            profileName: profileName ?? row.profileName,
            profilePictureUrl: profilePictureUrl ?? row.profilePictureUrl,
            qrCode: status === "connected" ? null : row.qrCode,
            pairingCode: status === "connected" ? null : row.pairingCode,
            lastConnectedAt:
              status === "connected" ? new Date() : row.lastConnectedAt,
          })
          .where(eq(whatsappInstance.id, row.id));
      } else {
        console.log(
          "[whatsapp:webhook] unhandled-event",
          JSON.stringify({ event, instance }),
        );
      }

      set.status = 204;
      return null;
    },
    {
      body: t.Any(),
    },
  )

  .use(AuthGuard)

  .guard({ auth: true }, (app) =>
    app
      .post("/instance", async ({ user }) => {
        const existing = await drizzle
          .select()
          .from(whatsappInstance)
          .where(eq(whatsappInstance.userId, user.id))
          .limit(1);

        if (existing[0]) {
          const row = existing[0];
          // Verify it still lives on Evolution's side
          try {
            const state = await evolution.connectionState(
              row.instanceName,
              row.apiKey,
            );
            const mapped = mapEvolutionState(state.instance.state);
            if (mapped !== row.status) {
              await drizzle
                .update(whatsappInstance)
                .set({ status: mapped })
                .where(eq(whatsappInstance.id, row.id));
              row.status = mapped;
            }
            return {
              id: row.id,
              instanceName: row.instanceName,
              status: row.status,
              qrCode: row.status === "connected" ? null : row.qrCode,
              pairingCode: row.status === "connected" ? null : row.pairingCode,
              phoneNumber: row.phoneNumber,
            };
          } catch (err) {
            if (!(err instanceof EvolutionApiError) || err.status !== 404) {
              throw err;
            }
            // Upstream gone — recreate below
            await drizzle
              .delete(whatsappInstance)
              .where(eq(whatsappInstance.id, row.id));
          }
        }

        const instanceName = `${slugForUser(user.id)}-${Date.now().toString(36)}`;

        const created = await evolution.createInstance({
          instanceName,
          integration: "WHATSAPP-BAILEYS",
          qrcode: true,
          webhook: {
            url: `${env.PUBLIC_WEBHOOK_URL}/whatsapp/webhook`,
            events: [...WEBHOOK_EVENTS],
            byEvents: false,
          },
        });

        const apiKey = resolveHash(created.hash);

        const initialQr = created.qrcode?.base64
          ? {
              qrCode: created.qrcode.base64,
              pairingCode: created.qrcode.pairingCode ?? null,
            }
          : await harvestInitialQr(instanceName, apiKey);

        const [row] = await drizzle
          .insert(whatsappInstance)
          .values({
            userId: user.id,
            instanceName,
            evolutionInstanceId: created.instance.instanceId,
            apiKey,
            status: "connecting",
            qrCode: initialQr.qrCode,
            pairingCode: initialQr.pairingCode,
          })
          .returning();

        return {
          id: row.id,
          instanceName: row.instanceName,
          status: row.status,
          qrCode: row.qrCode,
          pairingCode: row.pairingCode,
          phoneNumber: row.phoneNumber,
        };
      })

      .get("/instance/me", async ({ user, set }) => {
        const [row] = await drizzle
          .select()
          .from(whatsappInstance)
          .where(eq(whatsappInstance.userId, user.id))
          .limit(1);

        if (!row) {
          set.status = 404;
          return { error: "no_instance" };
        }

        let current = row;

        if (current.status !== "connected") {
          try {
            const state = await evolution.connectionState(
              current.instanceName,
              current.apiKey,
            );
            const mapped = mapEvolutionState(state.instance.state);
            if (mapped === "connected" && current.status !== "connected") {
              let phone = current.phoneNumber;
              let profileName = current.profileName;
              let profilePictureUrl = current.profilePictureUrl;
              try {
                const details = await evolution.fetchInstance(
                  current.instanceName,
                  current.apiKey,
                );
                if (details) {
                  phone =
                    (details.ownerJid?.split("@")[0] ?? null) ??
                    details.number ??
                    phone;
                  profileName = details.profileName ?? profileName;
                  profilePictureUrl = details.profilePicUrl ?? profilePictureUrl;
                }
              } catch {}
              try {
                await ensureWebhook(current.instanceName, current.apiKey);
              } catch {}
              const [updated] = await drizzle
                .update(whatsappInstance)
                .set({
                  status: "connected",
                  phoneNumber: phone,
                  profileName,
                  profilePictureUrl,
                  qrCode: null,
                  pairingCode: null,
                  lastConnectedAt: new Date(),
                })
                .where(eq(whatsappInstance.id, current.id))
                .returning();
              if (updated) current = updated;
            } else if (mapped !== current.status) {
              const [updated] = await drizzle
                .update(whatsappInstance)
                .set({ status: mapped })
                .where(eq(whatsappInstance.id, current.id))
                .returning();
              if (updated) current = updated;
            }
          } catch (err) {
            if (err instanceof EvolutionApiError && err.status === 404) {
              // Instance vanished upstream; drop our record so /instance can recreate
              await drizzle
                .delete(whatsappInstance)
                .where(eq(whatsappInstance.id, current.id));
              set.status = 404;
              return { error: "no_instance" };
            }
            // Network hiccup — fall through with cached row
          }
        }

        return {
          id: current.id,
          instanceName: current.instanceName,
          status: current.status,
          qrCode: current.status === "connected" ? null : current.qrCode,
          pairingCode: current.status === "connected" ? null : current.pairingCode,
          phoneNumber: current.phoneNumber,
        };
      })

      .post("/instance/refresh-webhook", async ({ user, set }) => {
        const [row] = await drizzle
          .select()
          .from(whatsappInstance)
          .where(eq(whatsappInstance.userId, user.id))
          .limit(1);
        if (!row) {
          set.status = 404;
          return { error: "no_instance" };
        }
        try {
          await ensureWebhook(row.instanceName, row.apiKey);
          return {
            ok: true,
            url: `${env.PUBLIC_WEBHOOK_URL}/whatsapp/webhook`,
            events: [...WEBHOOK_EVENTS],
          };
        } catch (err) {
          set.status = 502;
          return {
            error: "webhook_failed",
            message: err instanceof Error ? err.message : String(err),
          };
        }
      })

      .post("/instance/reconnect", async ({ user, set }) => {
        const [row] = await drizzle
          .select()
          .from(whatsappInstance)
          .where(eq(whatsappInstance.userId, user.id))
          .limit(1);

        if (!row) {
          set.status = 404;
          return { error: "no_instance" };
        }

        try {
          const state = await evolution.connectionState(
            row.instanceName,
            row.apiKey,
          );
          const mapped = mapEvolutionState(state.instance.state);
          if (mapped === "connected") {
            try {
              await ensureWebhook(row.instanceName, row.apiKey);
            } catch {}
            const [updated] = await drizzle
              .update(whatsappInstance)
              .set({
                status: "connected",
                qrCode: null,
                pairingCode: null,
                lastConnectedAt: new Date(),
              })
              .where(eq(whatsappInstance.id, row.id))
              .returning();
            return {
              id: updated!.id,
              instanceName: updated!.instanceName,
              status: updated!.status,
              qrCode: null,
              pairingCode: null,
              phoneNumber: updated!.phoneNumber,
            };
          }
        } catch (err) {
          if (err instanceof EvolutionApiError && err.status === 404) {
            console.warn(
              `[whatsapp] instance ${row.instanceName} gone upstream — recreating`,
            );
            await drizzle
              .delete(whatsappInstance)
              .where(eq(whatsappInstance.id, row.id));

            const instanceName = `${slugForUser(user.id)}-${Date.now().toString(36)}`;
            const created = await evolution.createInstance({
              instanceName,
              integration: "WHATSAPP-BAILEYS",
              qrcode: true,
              webhook: {
                url: `${env.PUBLIC_WEBHOOK_URL}/whatsapp/webhook`,
                events: [...WEBHOOK_EVENTS],
                byEvents: false,
              },
            });
            const apiKey = resolveHash(created.hash);
            const initialQr = created.qrcode?.base64
              ? {
                  qrCode: created.qrcode.base64,
                  pairingCode: created.qrcode.pairingCode ?? null,
                }
              : await harvestInitialQr(instanceName, apiKey);

            const [recreated] = await drizzle
              .insert(whatsappInstance)
              .values({
                userId: user.id,
                instanceName,
                evolutionInstanceId: created.instance.instanceId,
                apiKey,
                status: "connecting",
                qrCode: initialQr.qrCode,
                pairingCode: initialQr.pairingCode,
              })
              .returning();

            return {
              id: recreated!.id,
              instanceName: recreated!.instanceName,
              status: recreated!.status,
              qrCode: recreated!.qrCode,
              pairingCode: recreated!.pairingCode,
              phoneNumber: recreated!.phoneNumber,
            };
          }
          console.warn(
            `[whatsapp] connectionState failed for ${row.instanceName}:`,
            err instanceof Error ? err.message : err,
          );
        }

        try {
          await ensureWebhook(row.instanceName, row.apiKey);
        } catch {}

        try {
          await evolution.restart(row.instanceName, row.apiKey);
        } catch (err) {
          console.warn(
            `[whatsapp] restart failed for ${row.instanceName}:`,
            err instanceof Error ? err.message : err,
          );
        }

        const fresh = await harvestInitialQr(row.instanceName, row.apiKey);

        const [updated] = await drizzle
          .update(whatsappInstance)
          .set({
            status: "connecting",
            qrCode: fresh.qrCode ?? row.qrCode,
            pairingCode: fresh.pairingCode ?? row.pairingCode,
          })
          .where(eq(whatsappInstance.id, row.id))
          .returning();

        return {
          id: updated!.id,
          instanceName: updated!.instanceName,
          status: updated!.status,
          qrCode: updated!.qrCode,
          pairingCode: updated!.pairingCode,
          phoneNumber: updated!.phoneNumber,
        };
      })

      .delete("/instance", async ({ user }) => {
        const [row] = await drizzle
          .select()
          .from(whatsappInstance)
          .where(eq(whatsappInstance.userId, user.id))
          .limit(1);
        if (!row) return { ok: true };

        try {
          await evolution.logout(row.instanceName, row.apiKey);
        } catch {}
        try {
          await evolution.deleteInstance(row.instanceName, row.apiKey);
        } catch {}

        await drizzle
          .delete(whatsappInstance)
          .where(eq(whatsappInstance.id, row.id));

        return { ok: true };
      })

      .get("/conversations", async ({ user }) => {
        const rows = await drizzle
          .select()
          .from(conversation)
          .where(eq(conversation.userId, user.id))
          .orderBy(desc(conversation.lastMessageAt));
        return {
          items: rows.map((c) => ({
            id: c.id,
            contactJid: c.contactJid,
            contactPhone: c.contactPhone,
            contactName: c.contactName,
            contactAvatarUrl: c.contactAvatarUrl,
            status: c.status,
            preview: c.lastMessagePreview,
            lastMessageAt: c.lastMessageAt,
            createdAt: c.createdAt,
          })),
        };
      })

      .get(
        "/conversations/:id",
        async ({ user, params, set }) => {
          const [conv] = await drizzle
            .select()
            .from(conversation)
            .where(
              and(
                eq(conversation.id, params.id),
                eq(conversation.userId, user.id),
              ),
            )
            .limit(1);
          if (!conv) {
            set.status = 404;
            return { error: "not_found" };
          }
          const msgs = await drizzle
            .select()
            .from(message)
            .where(eq(message.conversationId, conv.id))
            .orderBy(asc(message.createdAt))
            .limit(200);
          return {
            id: conv.id,
            contactJid: conv.contactJid,
            contactPhone: conv.contactPhone,
            contactName: conv.contactName,
            contactAvatarUrl: conv.contactAvatarUrl,
            status: conv.status,
            preview: conv.lastMessagePreview,
            lastMessageAt: conv.lastMessageAt,
            createdAt: conv.createdAt,
            messages: msgs.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              status: m.status,
              error: m.error,
              createdAt: m.createdAt,
            })),
          };
        },
        { params: t.Object({ id: t.String() }) },
      )

      .post(
        "/conversations/:id/messages",
        async ({ user, params, body, set }) => {
          const [conv] = await drizzle
            .select()
            .from(conversation)
            .where(
              and(
                eq(conversation.id, params.id),
                eq(conversation.userId, user.id),
              ),
            )
            .limit(1);
          if (!conv) {
            set.status = 404;
            return { error: "not_found" };
          }
          const [inst] = await drizzle
            .select()
            .from(whatsappInstance)
            .where(eq(whatsappInstance.id, conv.instanceId))
            .limit(1);
          if (!inst || inst.status !== "connected") {
            set.status = 422;
            return { error: "instance_not_connected" };
          }

          const phone = conv.contactPhone
            ? conv.contactPhone
            : conv.contactJid.endsWith("@lid")
              ? conv.contactJid
              : conv.contactJid.split("@")[0];
          if (!phone) {
            set.status = 422;
            return { error: "missing_phone" };
          }

          const sendStart = Date.now();
          try {
            console.log(
              "[whatsapp:agent-send] start",
              JSON.stringify({
                conversationId: conv.id,
                instance: inst.instanceName,
                to: phone,
                bytes: body.text.length,
              }),
            );
            const sent = await evolution.sendText(
              inst.instanceName,
              { number: phone, text: body.text },
              inst.apiKey,
            );
            const evoId = sent?.key?.id ?? null;
            console.log(
              "[whatsapp:agent-send] ok",
              JSON.stringify({
                conversationId: conv.id,
                evoMessageId: evoId,
                tookMs: Date.now() - sendStart,
              }),
            );
            const [stored] = await drizzle
              .insert(message)
              .values({
                conversationId: conv.id,
                role: "agent",
                content: body.text,
                evolutionMessageId: evoId,
                status: "sent",
              })
              .returning();
            const now = new Date();
            await drizzle
              .update(conversation)
              .set({
                lastMessagePreview:
                  body.text.length > 200
                    ? `${body.text.slice(0, 199)}…`
                    : body.text,
                lastMessageAt: now,
                status: "human",
                updatedAt: now,
              })
              .where(eq(conversation.id, conv.id));
            return {
              id: stored?.id,
              role: "agent",
              content: body.text,
              createdAt: stored?.createdAt ?? now,
              status: "sent",
            };
          } catch (err) {
            const detail =
              err instanceof EvolutionApiError
                ? { status: err.status, body: err.body, message: err.message }
                : {
                    message:
                      err instanceof Error ? err.message : String(err),
                  };
            console.error(
              "[whatsapp:agent-send] fail",
              JSON.stringify({
                conversationId: conv.id,
                tookMs: Date.now() - sendStart,
                to: phone,
                ...detail,
              }),
            );
            const msg =
              err instanceof EvolutionApiError
                ? `${err.status}: ${err.message}`
                : err instanceof Error
                  ? err.message
                  : "Falha ao enviar.";
            await drizzle.insert(message).values({
              conversationId: conv.id,
              role: "agent",
              content: body.text,
              status: "failed",
              error: msg,
            });
            set.status = 502;
            return { error: "send_failed", message: msg };
          }
        },
        {
          params: t.Object({ id: t.String() }),
          body: t.Object({
            text: t.String({ minLength: 1, maxLength: 4000 }),
          }),
        },
      )

      .post(
        "/conversations/:id/status",
        async ({ user, params, body, set }) => {
          const [conv] = await drizzle
            .select({ id: conversation.id })
            .from(conversation)
            .where(
              and(
                eq(conversation.id, params.id),
                eq(conversation.userId, user.id),
              ),
            )
            .limit(1);
          if (!conv) {
            set.status = 404;
            return { error: "not_found" };
          }
          await setConversationStatus(conv.id, user.id, body.status);
          return { ok: true, status: body.status };
        },
        {
          params: t.Object({ id: t.String() }),
          body: t.Object({
            status: t.Union(conversationStatuses.map((s) => t.Literal(s))),
          }),
        },
      ),
  );
