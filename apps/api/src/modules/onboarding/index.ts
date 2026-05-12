import { and, desc, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

import { drizzle } from "../../config/db";
import { getAIProvider } from "../../shared/ai";
import { extractFileText, fetchSiteText } from "../../shared/ingest";
import { assistant, assistantTones } from "../../shared/tables/assistant.table";
import { business, weekendOptions } from "../../shared/tables/business.table";
import { knowledge } from "../../shared/tables/knowledge.table";
import { user } from "../../shared/tables/user.table";
import { whatsappInstance } from "../../shared/tables/whatsapp-instance.table";
import { AuthGuard } from "../auth";
import { buildAssistantSystemPrompt } from "../../shared/ai/system-prompt";

const BusinessBody = t.Object({
  name: t.String({ maxLength: 200 }),
  category: t.String({ maxLength: 80 }),
  phone: t.String({ maxLength: 40 }),
  address: t.String({ maxLength: 240 }),
  hoursFrom: t.String({ maxLength: 8 }),
  hoursTo: t.String({ maxLength: 8 }),
  weekend: t.Union([
    t.Literal(""),
    ...weekendOptions.map((o) => t.Literal(o)),
  ]),
  description: t.String({ maxLength: 2000 }),
});

const AssistantBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 60 }),
  tone: t.Union(assistantTones.map((tone) => t.Literal(tone))),
  avatar: t.Integer({ minimum: 0, maximum: 32 }),
  greeting: t.String({ maxLength: 500 }),
  permissions: t.Object({
    scheduling: t.Boolean(),
    payments: t.Boolean(),
    handoff: t.Boolean(),
    discounts: t.Boolean(),
  }),
});

const ChatBody = t.Object({
  messages: t.Array(
    t.Object({
      role: t.Union([t.Literal("user"), t.Literal("assistant")]),
      content: t.String({ minLength: 1, maxLength: 4000 }),
    }),
    { minItems: 1, maxItems: 40 },
  ),
});

const ImportUrlBody = t.Object({
  url: t.String({ minLength: 4, maxLength: 500 }),
});

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function humanizeAIError(err: unknown): { status: number; message: string } {
  if (!(err instanceof Error)) {
    return { status: 500, message: "Falha desconhecida ao chamar o modelo." };
  }
  const raw = err.message ?? "";
  // Gemini errors come as '... {"error":{"code":403,"message":"...","status":"..."}}'
  const match = raw.match(/\{[\s\S]*"error"[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]) as {
        error?: { code?: number; message?: string; status?: string };
      };
      const code = parsed.error?.code ?? 500;
      const status = parsed.error?.status ?? "";
      const msg = parsed.error?.message ?? raw;
      if (code === 403 || status === "PERMISSION_DENIED") {
        return {
          status: 502,
          message:
            "O modelo recusou: chave sem permissão pra esse projeto/modelo. Gera uma nova chave em aistudio.google.com/apikey e atualiza o .env.",
        };
      }
      if (code === 401 || status === "UNAUTHENTICATED") {
        return {
          status: 502,
          message:
            "Chave da IA inválida. Verifica GEMINI_API_KEY no .env da API.",
        };
      }
      if (code === 429 || status === "RESOURCE_EXHAUSTED") {
        return {
          status: 429,
          message:
            "Quota esgotada no provider. Espera um instante ou troca de chave.",
        };
      }
      return { status: code >= 400 && code < 600 ? code : 502, message: msg };
    } catch {
      // fallthrough
    }
  }
  if (/GEMINI_API_KEY/.test(raw)) {
    return { status: 500, message: raw };
  }
  return { status: 502, message: raw || "Falha ao chamar o modelo." };
}

function serializeBusiness(row: typeof business.$inferSelect) {
  return {
    name: row.name,
    category: row.category,
    phone: row.phone,
    address: row.address,
    hoursFrom: row.hoursFrom,
    hoursTo: row.hoursTo,
    weekend: row.weekend,
    description: row.description,
  };
}

function serializeAssistant(row: typeof assistant.$inferSelect) {
  return {
    name: row.name,
    tone: row.tone,
    avatar: row.avatar,
    greeting: row.greeting,
    permissions: row.permissions,
    published: row.published,
    publishedAt: row.publishedAt,
  };
}

function serializeWhatsapp(
  row: typeof whatsappInstance.$inferSelect | undefined,
) {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    phoneNumber: row.phoneNumber,
    profileName: row.profileName,
  };
}

function serializeKnowledge(row: typeof knowledge.$inferSelect) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    sourceUrl: row.sourceUrl,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    preview: row.content.slice(0, 240),
    createdAt: row.createdAt,
  };
}

export const OnboardingModule = new Elysia({
  name: "onboarding",
  prefix: "/onboarding",
})
  .use(AuthGuard)
  .guard({ auth: true }, (app) =>
    app
      .get("/me", async ({ user: current }) => {
        const [biz] = await drizzle
          .select()
          .from(business)
          .where(eq(business.userId, current.id))
          .limit(1);
        const [asst] = await drizzle
          .select()
          .from(assistant)
          .where(eq(assistant.userId, current.id))
          .limit(1);
        const [wa] = await drizzle
          .select()
          .from(whatsappInstance)
          .where(eq(whatsappInstance.userId, current.id))
          .limit(1);
        const [usr] = await drizzle
          .select({
            onboardingCompleted: user.onboardingCompleted,
            onboardingCompletedAt: user.onboardingCompletedAt,
          })
          .from(user)
          .where(eq(user.id, current.id))
          .limit(1);
        const docs = await drizzle
          .select()
          .from(knowledge)
          .where(eq(knowledge.userId, current.id))
          .orderBy(desc(knowledge.createdAt));

        return {
          business: biz ? serializeBusiness(biz) : null,
          assistant: asst ? serializeAssistant(asst) : null,
          whatsapp: serializeWhatsapp(wa),
          knowledge: docs.map(serializeKnowledge),
          completed: usr?.onboardingCompleted ?? false,
          completedAt: usr?.onboardingCompletedAt ?? null,
        };
      })

      .put(
        "/business",
        async ({ user: current, body }) => {
          const [row] = await drizzle
            .insert(business)
            .values({ userId: current.id, ...body })
            .onConflictDoUpdate({
              target: business.userId,
              set: { ...body, updatedAt: new Date() },
            })
            .returning();

          return serializeBusiness(row);
        },
        { body: BusinessBody },
      )

      .put(
        "/assistant",
        async ({ user: current, body }) => {
          const [row] = await drizzle
            .insert(assistant)
            .values({ userId: current.id, ...body })
            .onConflictDoUpdate({
              target: assistant.userId,
              set: { ...body, updatedAt: new Date() },
            })
            .returning();

          return serializeAssistant(row);
        },
        { body: AssistantBody },
      )

      .get("/knowledge", async ({ user: current }) => {
        const docs = await drizzle
          .select()
          .from(knowledge)
          .where(eq(knowledge.userId, current.id))
          .orderBy(desc(knowledge.createdAt));
        return { items: docs.map(serializeKnowledge) };
      })

      .post(
        "/knowledge/url",
        async ({ user: current, body, set }) => {
          let parsed: URL;
          try {
            parsed = new URL(body.url);
            if (!/^https?:$/.test(parsed.protocol))
              throw new Error("URL precisa começar com http(s)://");
          } catch (err) {
            set.status = 400;
            return {
              error: "invalid_url",
              message:
                err instanceof Error ? err.message : "URL inválida.",
            };
          }

          try {
            const { title, text, rawLength } = await fetchSiteText(
              parsed.toString(),
            );
            const [row] = await drizzle
              .insert(knowledge)
              .values({
                userId: current.id,
                kind: "url",
                title,
                sourceUrl: parsed.toString(),
                mimeType: "text/html",
                content: text,
                sizeBytes: rawLength,
              })
              .returning();
            return serializeKnowledge(row);
          } catch (err) {
            set.status = 422;
            return {
              error: "fetch_failed",
              message:
                err instanceof Error
                  ? err.message
                  : "Não consegui importar essa página.",
            };
          }
        },
        { body: ImportUrlBody },
      )

      .post(
        "/knowledge/upload",
        async ({ user: current, body, set }) => {
          const file = (body as { file?: File }).file;
          if (!file) {
            set.status = 400;
            return { error: "missing_file" };
          }
          if (file.size > MAX_UPLOAD_BYTES) {
            set.status = 413;
            return {
              error: "file_too_large",
              message: `Arquivo acima do limite de ${Math.round(
                MAX_UPLOAD_BYTES / 1024 / 1024,
              )}MB.`,
            };
          }

          try {
            const buffer = await file.arrayBuffer();
            const { text, rawLength } = await extractFileText(
              buffer,
              file.type,
              file.name,
            );
            const [row] = await drizzle
              .insert(knowledge)
              .values({
                userId: current.id,
                kind: "file",
                title: file.name,
                mimeType: file.type || null,
                content: text,
                sizeBytes: rawLength,
              })
              .returning();
            return serializeKnowledge(row);
          } catch (err) {
            set.status = 422;
            return {
              error: "extract_failed",
              message:
                err instanceof Error
                  ? err.message
                  : "Não consegui processar o arquivo.",
            };
          }
        },
        {
          body: t.Object({
            file: t.File({ maxSize: MAX_UPLOAD_BYTES }),
          }),
        },
      )

      .delete(
        "/knowledge/:id",
        async ({ user: current, params, set }) => {
          const result = await drizzle
            .delete(knowledge)
            .where(
              and(
                eq(knowledge.id, params.id),
                eq(knowledge.userId, current.id),
              ),
            )
            .returning({ id: knowledge.id });
          if (!result.length) {
            set.status = 404;
            return { error: "not_found" };
          }
          return { ok: true };
        },
        { params: t.Object({ id: t.String() }) },
      )

      .post(
        "/playground/chat",
        async ({ user: current, body, set }) => {
          const [biz] = await drizzle
            .select()
            .from(business)
            .where(eq(business.userId, current.id))
            .limit(1);
          const [asst] = await drizzle
            .select()
            .from(assistant)
            .where(eq(assistant.userId, current.id))
            .limit(1);
          const docs = await drizzle
            .select()
            .from(knowledge)
            .where(eq(knowledge.userId, current.id))
            .orderBy(desc(knowledge.createdAt));

          if (!asst) {
            set.status = 422;
            return { error: "assistant_missing" };
          }

          const systemPrompt = buildAssistantSystemPrompt({
            business: biz ?? null,
            assistant: asst,
            knowledge: docs,
          });

          try {
            const ai = getAIProvider();
            const response = await ai.chat({
              systemPrompt,
              messages: body.messages,
              maxOutputTokens: 512,
            });
            return {
              reply: response.text,
              model: response.model,
              provider: response.provider,
              usage: response.usage,
            };
          } catch (err) {
            const humanized = humanizeAIError(err);
            set.status = humanized.status;
            return { error: "ai_failed", message: humanized.message };
          }
        },
        { body: ChatBody },
      )

      .post("/complete", async ({ user: current, set }) => {
        const [biz] = await drizzle
          .select()
          .from(business)
          .where(eq(business.userId, current.id))
          .limit(1);
        const [asst] = await drizzle
          .select()
          .from(assistant)
          .where(eq(assistant.userId, current.id))
          .limit(1);
        const [wa] = await drizzle
          .select()
          .from(whatsappInstance)
          .where(eq(whatsappInstance.userId, current.id))
          .limit(1);

        if (!biz || !biz.name || !biz.category) {
          set.status = 422;
          return { error: "business_incomplete" };
        }
        if (!asst || !asst.name) {
          set.status = 422;
          return { error: "assistant_incomplete" };
        }
        if (!wa || wa.status !== "connected") {
          set.status = 422;
          return { error: "whatsapp_not_connected" };
        }

        const now = new Date();
        await drizzle
          .update(assistant)
          .set({ published: true, publishedAt: now })
          .where(eq(assistant.userId, current.id));

        await drizzle
          .update(user)
          .set({
            onboardingCompleted: true,
            onboardingCompletedAt: now,
          })
          .where(eq(user.id, current.id));

        return { ok: true, completedAt: now };
      }),
  );
