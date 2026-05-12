import { apiFetch } from "./api";

export type InboxConversationStatus = "ai" | "human" | "waiting" | "closed";

export type InboxMessageRole = "customer" | "assistant" | "agent" | "system";

export type InboxMessageStatus = "sent" | "failed" | "received";

export interface InboxConversation {
  id: string;
  contactJid: string;
  contactPhone: string | null;
  contactName: string | null;
  contactAvatarUrl: string | null;
  status: InboxConversationStatus;
  preview: string;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface InboxMessage {
  id: string;
  role: InboxMessageRole;
  content: string;
  status: InboxMessageStatus;
  error: string | null;
  createdAt: string;
}

export interface InboxConversationDetail extends InboxConversation {
  messages: InboxMessage[];
}

export function listInboxConversations() {
  return apiFetch<{ items: InboxConversation[] }>("/whatsapp/conversations", {
    method: "GET",
  });
}

export function getInboxConversation(id: string) {
  return apiFetch<InboxConversationDetail>(
    `/whatsapp/conversations/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
}

export function sendInboxMessage(id: string, text: string) {
  return apiFetch<InboxMessage>(
    `/whatsapp/conversations/${encodeURIComponent(id)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
}

export function setConversationStatus(
  id: string,
  status: InboxConversationStatus,
) {
  return apiFetch<{ ok: boolean; status: InboxConversationStatus }>(
    `/whatsapp/conversations/${encodeURIComponent(id)}/status`,
    {
      method: "POST",
      body: JSON.stringify({ status }),
    },
  );
}

const STATUS_LABEL: Record<InboxConversationStatus, string> = {
  ai: "IA",
  human: "Humano",
  waiting: "Aguardando",
  closed: "Encerrada",
};

export function statusLabel(status: InboxConversationStatus) {
  return STATUS_LABEL[status];
}

export function contactDisplayName(c: InboxConversation) {
  if (c.contactName && c.contactName.trim()) return c.contactName;
  if (c.contactPhone) return formatPhone(c.contactPhone);
  return c.contactJid;
}

export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(
      4,
      9,
    )}-${digits.slice(9)}`;
  }
  if (digits.length === 12 && digits.startsWith("55")) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(
      4,
      8,
    )}-${digits.slice(8)}`;
  }
  return `+${digits}`;
}

export function colorForJid(jid: string) {
  let hash = 0;
  for (let i = 0; i < jid.length; i += 1) {
    hash = (hash * 31 + jid.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `oklch(0.82 0.14 ${hue})`;
}

export function relativeTime(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return "—";
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
