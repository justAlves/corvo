import { and, desc, eq, sql } from "drizzle-orm";

import { drizzle } from "../../config/db";
import { getAIProvider, type ChatTurn } from "../../shared/ai";
import { buildAssistantSystemPrompt } from "../../shared/ai/system-prompt";
import { assistant } from "../../shared/tables/assistant.table";
import { business } from "../../shared/tables/business.table";
import {
  conversation,
  type ConversationStatus,
} from "../../shared/tables/conversation.table";
import { knowledge } from "../../shared/tables/knowledge.table";
import { message } from "../../shared/tables/message.table";
import { whatsappInstance } from "../../shared/tables/whatsapp-instance.table";
import { EvolutionApiError, evolution } from "./evolution-client";

const MAX_HISTORY = 20;
const PREVIEW_MAX = 200;

function log(stage: string, payload: Record<string, unknown> = {}) {
  console.log(`[whatsapp:${stage}]`, JSON.stringify(payload));
}

function logWarn(stage: string, payload: Record<string, unknown> = {}) {
  console.warn(`[whatsapp:${stage}]`, JSON.stringify(payload));
}

function logError(stage: string, payload: Record<string, unknown> = {}) {
  console.error(`[whatsapp:${stage}]`, JSON.stringify(payload));
}

interface InboundEnvelope {
  remoteJid: string;
  fromMe: boolean;
  evolutionMessageId: string | null;
  pushName: string | null;
  text: string;
  timestamp: Date;
  senderPn: string | null;
}

function extractText(msg: Record<string, unknown> | null | undefined): string | null {
  if (!msg) return null;
  if (typeof msg.conversation === "string" && msg.conversation.trim()) {
    return msg.conversation;
  }
  const ext = msg.extendedTextMessage as
    | { text?: string }
    | undefined;
  if (ext?.text && typeof ext.text === "string" && ext.text.trim()) {
    return ext.text;
  }
  const img = msg.imageMessage as { caption?: string } | undefined;
  if (img?.caption && img.caption.trim()) return img.caption;
  const vid = msg.videoMessage as { caption?: string } | undefined;
  if (vid?.caption && vid.caption.trim()) return vid.caption;
  const btn = msg.buttonsResponseMessage as
    | { selectedDisplayText?: string }
    | undefined;
  if (btn?.selectedDisplayText) return btn.selectedDisplayText;
  const list = msg.listResponseMessage as
    | { title?: string; singleSelectReply?: { selectedRowId?: string } }
    | undefined;
  if (list?.title) return list.title;
  return null;
}

export function parseMessagesUpsert(
  data: Record<string, unknown> | undefined,
): InboundEnvelope[] {
  if (!data) return [];

  console.log("Raw webhook payload", JSON.stringify(data)); // Truncate to 4kb for readability
  const list: Record<string, unknown>[] = Array.isArray(
    (data as { messages?: unknown }).messages,
  )
    ? ((data as { messages: Record<string, unknown>[] }).messages)
    : [data];

  const result: InboundEnvelope[] = [];
  const drops = { noKey: 0, group: 0, status: 0, noText: 0 };
  for (const item of list) {
    const key = item.key as
      | {
          remoteJidAlt?: string;
          fromMe?: boolean;
          id?: string;
          senderPn?: string;
          participantPn?: string;
          participant?: string;
        }
      | undefined;
    if (!key?.remoteJid) {
      drops.noKey += 1;
      continue;
    }
    if (key.remoteJid.endsWith("@g.us")) {
      drops.group += 1;
      continue;
    }
    if (key.remoteJid === "status@broadcast") {
      drops.status += 1;
      continue;
    }
    const text = extractText(item.message as Record<string, unknown> | undefined);
    if (!text) {
      drops.noText += 1;
      continue;
    }
    const tsRaw = item.messageTimestamp;
    let timestamp = new Date();
    if (typeof tsRaw === "number") timestamp = new Date(tsRaw * 1000);
    else if (typeof tsRaw === "string" && /^\d+$/.test(tsRaw)) {
      timestamp = new Date(Number(tsRaw) * 1000);
    }
    const senderPn =
      (typeof key.senderPn === "string" && key.senderPn) ||
      (typeof key.participantPn === "string" && key.participantPn) ||
      null;
      console.log("Parsed message", {
      remoteJid: key.remoteJidAlt,
      fromMe: !!key.fromMe,
      evolutionMessageId: key.id ?? null,
      pushName:
        typeof item.pushName === "string" ? (item.pushName as string) : null,
      text,
      timestamp,
      senderPn,
    });
    result.push({
      remoteJid: key.remoteJidAlt,
      fromMe: !!key.fromMe,
      evolutionMessageId: key.id ?? null,
      pushName:
        typeof item.pushName === "string" ? (item.pushName as string) : null,
      text,
      timestamp,
      senderPn,
    });
  }
  log("parse", {
    incoming: list.length,
    kept: result.length,
    drops,
  });
  return result;
}

function jidToPhone(jid: string): string | null {
  const match = jid.match(/^(\d+)@/);
  return match?.[1] ?? null;
}

function isLidJid(jid: string) {
  return jid.endsWith("@lid");
}

function resolveRecipientNumber(
  remoteJid: string,
  senderPn: string | null,
): { number: string; via: "senderPn" | "phone" | "jid" } {
  if (senderPn) {
    const digits = jidToPhone(senderPn) ?? senderPn.replace(/\D/g, "");
    if (digits) return { number: digits, via: "senderPn" };
  }
  if (!isLidJid(remoteJid)) {
    const phone = jidToPhone(remoteJid);
    if (phone) return { number: phone, via: "phone" };
  }
  return { number: remoteJid, via: "jid" };
}

function preview(text: string) {
  const single = text.replace(/\s+/g, " ").trim();
  return single.length > PREVIEW_MAX
    ? `${single.slice(0, PREVIEW_MAX - 1)}…`
    : single;
}

export async function processInboundMessage(
  instanceRow: typeof whatsappInstance.$inferSelect,
  envelope: InboundEnvelope,
) {
  const ctx = {
    instance: instanceRow.instanceName,
    userId: instanceRow.userId,
    jid: envelope.remoteJid,
    msgId: envelope.evolutionMessageId,
    fromMe: envelope.fromMe,
    textLen: envelope.text.length,
  };
  log("inbound:start", ctx);

  if (envelope.fromMe) {
    log("inbound:skip", { ...ctx, reason: "fromMe" });
    return;
  }

  if (isLidJid(envelope.remoteJid) && !envelope.senderPn) {
    logWarn("inbound:lid-no-pn", {
      ...ctx,
      hint: "raw key lacked senderPn/participantPn — replies may fail",
    });
  }

  const phone = isLidJid(envelope.remoteJid)
    ? envelope.senderPn
      ? jidToPhone(envelope.senderPn) ?? envelope.senderPn.replace(/\D/g, "")
      : null
    : jidToPhone(envelope.remoteJid);

  const [conv] = await drizzle
    .insert(conversation)
    .values({
      userId: instanceRow.userId,
      instanceId: instanceRow.id,
      contactJid: envelope.remoteJid,
      contactPhone: phone,
      contactName: envelope.pushName,
      lastMessagePreview: preview(envelope.text),
      lastMessageAt: envelope.timestamp,
    })
    .onConflictDoUpdate({
      target: [conversation.instanceId, conversation.contactJid],
      set: {
        contactName: sql`COALESCE(${conversation.contactName}, EXCLUDED.contact_name)`,
        contactPhone: sql`COALESCE(${conversation.contactPhone}, EXCLUDED.contact_phone)`,
        lastMessagePreview: preview(envelope.text),
        lastMessageAt: envelope.timestamp,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!conv) {
    logError("inbound:conv-upsert-empty", ctx);
    return;
  }

  await drizzle
    .insert(message)
    .values({
      conversationId: conv.id,
      role: "customer",
      content: envelope.text,
      evolutionMessageId: envelope.evolutionMessageId,
      status: "received",
      createdAt: envelope.timestamp,
    })
    .onConflictDoNothing({ target: message.evolutionMessageId });

  log("inbound:stored", { ...ctx, conversationId: conv.id, status: conv.status });

  if (conv.status !== "ai") {
    log("inbound:skip-reply", {
      ...ctx,
      conversationId: conv.id,
      reason: `status=${conv.status}`,
    });
    return;
  }

  await runAssistantReply(instanceRow, conv.id, envelope.remoteJid, envelope.senderPn);
}

async function runAssistantReply(
  instanceRow: typeof whatsappInstance.$inferSelect,
  conversationId: string,
  remoteJid: string,
  senderPn: string | null,
) {
  const userId = instanceRow.userId;
  const ctx = {
    instance: instanceRow.instanceName,
    userId,
    conversationId,
    jid: remoteJid,
  };

  const [asst] = await drizzle
    .select()
    .from(assistant)
    .where(eq(assistant.userId, userId))
    .limit(1);
  if (!asst) {
    logWarn("ai:skip", { ...ctx, reason: "assistant-missing" });
    return;
  }
  if (!asst.published) {
    logWarn("ai:skip", { ...ctx, reason: "assistant-unpublished" });
    return;
  }

  const [biz] = await drizzle
    .select()
    .from(business)
    .where(eq(business.userId, userId))
    .limit(1);
  const docs = await drizzle
    .select()
    .from(knowledge)
    .where(eq(knowledge.userId, userId))
    .orderBy(desc(knowledge.createdAt));

  const recent = await drizzle
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(desc(message.createdAt))
    .limit(MAX_HISTORY);

  const history = recent
    .reverse()
    .filter((m) => m.role === "customer" || m.role === "assistant")
    .map<ChatTurn>((m) => ({
      role: m.role === "customer" ? "user" : "assistant",
      content: m.content,
    }));

  if (!history.length) {
    logWarn("ai:skip", { ...ctx, reason: "empty-history" });
    return;
  }

  const [convRow] = await drizzle
    .select({ contactName: conversation.contactName })
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  const systemPrompt = buildAssistantSystemPrompt({
    business: biz ?? null,
    assistant: asst,
    knowledge: docs,
    mode: "live",
    contactName: convRow?.contactName ?? null,
  });

  log("ai:request", {
    ...ctx,
    historyTurns: history.length,
    knowledgeDocs: docs.length,
    systemPromptLen: systemPrompt.length,
  });

  let replyText = "";
  const aiStart = Date.now();
  try {
    const ai = getAIProvider();
    const response = await ai.chat({
      systemPrompt,
      messages: history,
      maxOutputTokens: 512,
    });
    replyText = response.text.trim();
    log("ai:response", {
      ...ctx,
      tookMs: Date.now() - aiStart,
      model: response.model,
      provider: response.provider,
      textLen: replyText.length,
      usage: response.usage,
    });
  } catch (err) {
    logError("ai:fail", {
      ...ctx,
      tookMs: Date.now() - aiStart,
      error: err instanceof Error ? err.message : String(err),
    });
    await drizzle.insert(message).values({
      conversationId,
      role: "system",
      content: "Assistente falhou ao gerar resposta.",
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  if (!replyText) {
    logWarn("ai:empty-reply", ctx);
    return;
  }

  const recipient = resolveRecipientNumber(remoteJid, senderPn);
  const sendStart = Date.now();
  try {
    const sent = await evolution.sendText(
      instanceRow.instanceName,
      { number: recipient.number, text: replyText },
      instanceRow.apiKey,
    );
    const evoId = sent?.key?.id ?? null;
    log("send:ok", {
      ...ctx,
      tookMs: Date.now() - sendStart,
      evoMessageId: evoId,
      to: recipient.number,
      via: recipient.via,
      bytes: replyText.length,
    });
    await drizzle.insert(message).values({
      conversationId,
      role: "assistant",
      content: replyText,
      evolutionMessageId: evoId,
      status: "sent",
    });
    await drizzle
      .update(conversation)
      .set({
        lastMessagePreview: preview(replyText),
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(conversation.id, conversationId));
  } catch (err) {
    const detail =
      err instanceof EvolutionApiError
        ? {
            status: err.status,
            body: err.body,
            message: err.message,
          }
        : { message: err instanceof Error ? err.message : String(err) };
    logError("send:fail", {
      ...ctx,
      tookMs: Date.now() - sendStart,
      to: recipient.number,
      via: recipient.via,
      ...detail,
    });
    await drizzle.insert(message).values({
      conversationId,
      role: "assistant",
      content: replyText,
      status: "failed",
      error:
        err instanceof EvolutionApiError
          ? `${err.status}: ${err.message}`
          : err instanceof Error
            ? err.message
            : String(err),
    });
  }
}

export async function setConversationStatus(
  conversationId: string,
  userId: string,
  status: ConversationStatus,
) {
  await drizzle
    .update(conversation)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(conversation.id, conversationId), eq(conversation.userId, userId)),
    );
}
