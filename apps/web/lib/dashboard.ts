/**
 * Dashboard data layer — server-side fetchers that forward request cookies
 * to the API so Better Auth sessions are honoured in RSC context.
 */

import { cookies } from "next/headers";
import { API_BASE } from "./api";

async function serverFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} on ${path}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export type ConversationStatus = "IA" | "Humano" | "Aguardando";

export type ConversationMessage =
  | { from: "them" | "ai"; text: string; at?: string }
  | { from: "system"; text: string; at?: string };

export interface Conversation {
  id: string;
  name: string;
  phone: string;
  color: string;
  preview: string;
  status: ConversationStatus;
  time: string;
  messages: ConversationMessage[];
  customer: {
    since: string;
    totalConversations: number;
    lastBooking: string;
    ltv: string;
  };
}

export interface Metric {
  key: "conversations" | "automation" | "avgTime" | "bookings";
  label: string;
  value: string;
  delta: string;
  icon: "inbox" | "spark" | "clock" | "calendar";
}

export interface VolumePoint {
  day: string;
  ai: number;
  human: number;
}

export interface IntentRow {
  label: string;
  pct: number;
}

export interface KnowledgeRow {
  id: string;
  name: string;
  meta: string;
  ok: boolean;
  kind: string;
}

export interface AssistantSummary {
  name: string;
  businessName: string;
  publishedAt: string | null;
  totalConversations: number;
  automationPct: number;
  greeting: string;
}

export interface BusinessProfile {
  name: string;
  category: string;
  phone: string;
  address: string;
  hoursFrom: string;
  hoursTo: string;
  weekend: "" | "sim" | "sabado" | "nao";
  description: string;
}

export interface AssistantFull {
  name: string;
  tone: "descolada" | "amigavel" | "profissional" | "divertida";
  avatar: number;
  greeting: string;
  permissions: {
    scheduling: boolean;
    payments: boolean;
    handoff: boolean;
    discounts: boolean;
  };
}

export interface DashboardOverview {
  greetingName: string;
  metrics: Metric[];
  volume: VolumePoint[];
  intents: IntentRow[];
  recent: Conversation[];
}

export interface AssistantPage {
  assistant: AssistantSummary;
  assistantFull: AssistantFull;
  business: BusinessProfile;
  knowledge: KnowledgeRow[];
}

export interface SettingsPage {
  plan: { name: string; price: string; renewsAt: string };
  team: { invitedCount: number };
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Marina Lopes",
    phone: "+55 11 9•••4892",
    color: "oklch(0.82 0.14 30)",
    preview: "9:15 com a Dra. Carla, terça. Agradeço!",
    status: "IA",
    time: "agora",
    messages: [
      { from: "them", text: "Oi, vocês têm horário terça de manhã pra limpeza?" },
      {
        from: "ai",
        text: "Oi Marina! Tenho sim 👋 Terça tenho 9:15 com a Dra. Carla e 10:30 com o Dr. Paulo. Prefere algum?",
      },
      { from: "them", text: "9:15 com a Carla" },
      { from: "ai", text: "Reservado! Te mando lembrete na segunda. 💚" },
    ],
    customer: {
      since: "março de 2026",
      totalConversations: 7,
      lastBooking: "15/04",
      ltv: "R$ 420",
    },
  },
  {
    id: "c2",
    name: "João Ramalho",
    phone: "+55 11 9•••0421",
    color: "oklch(0.82 0.14 200)",
    preview: "Duas pizzas grandes, uma margherita e…",
    status: "IA",
    time: "2m",
    messages: [
      { from: "them", text: "Boa noite, quero 2 pizzas grandes" },
      { from: "ai", text: "Boa noite, João! Claro. Qual sabor da primeira?" },
      { from: "them", text: "Margherita" },
      { from: "ai", text: "Feito. E a segunda?" },
    ],
    customer: {
      since: "janeiro de 2026",
      totalConversations: 12,
      lastBooking: "—",
      ltv: "R$ 318",
    },
  },
  {
    id: "c3",
    name: "Ana Pereira",
    phone: "+55 11 9•••1778",
    color: "oklch(0.82 0.14 295)",
    preview: "Preciso cancelar o de amanhã, dá?",
    status: "Aguardando",
    time: "8m",
    messages: [
      { from: "them", text: "Oi, preciso cancelar o de amanhã, dá?" },
      {
        from: "ai",
        text: "Oi Ana! Vi aqui o agendamento das 14h. Quer cancelar ou remarcar?",
      },
      { from: "them", text: "Remarcar pra semana que vem" },
    ],
    customer: {
      since: "fevereiro de 2026",
      totalConversations: 4,
      lastBooking: "30/04",
      ltv: "R$ 180",
    },
  },
  {
    id: "c4",
    name: "Rafael Costa",
    phone: "+55 11 9•••6604",
    color: "oklch(0.82 0.14 110)",
    preview: "Vocês aceitam PIX parcelado?",
    status: "Humano",
    time: "12m",
    messages: [
      { from: "them", text: "Vocês aceitam PIX parcelado?" },
      {
        from: "ai",
        text: "Vou chamar um atendente humano pra te ajudar com isso, Rafael. Só um segundinho 👋",
      },
      { from: "system", text: "Transferido pra Thiago (atendente)" },
    ],
    customer: {
      since: "abril de 2026",
      totalConversations: 1,
      lastBooking: "—",
      ltv: "R$ 0",
    },
  },
  {
    id: "c5",
    name: "Paula S.",
    phone: "+55 11 9•••9110",
    color: "oklch(0.82 0.14 40)",
    preview: "Chegou bonito, obrigada!",
    status: "IA",
    time: "20m",
    messages: [
      { from: "them", text: "Chegou bonito, obrigada!" },
      { from: "ai", text: "Que bom, Paula! 💚 Qualquer coisa, chama." },
    ],
    customer: {
      since: "novembro de 2025",
      totalConversations: 18,
      lastBooking: "—",
      ltv: "R$ 940",
    },
  },
  {
    id: "c6",
    name: "Luiz Mendes",
    phone: "+55 11 9•••5567",
    color: "oklch(0.82 0.14 260)",
    preview: "Quero saber valores do serviço de…",
    status: "IA",
    time: "28m",
    messages: [
      { from: "them", text: "Quero saber valores do serviço de design" },
      {
        from: "ai",
        text: "Oi Luiz! Posso te passar a tabela — pra que tipo de trabalho?",
      },
    ],
    customer: {
      since: "abril de 2026",
      totalConversations: 2,
      lastBooking: "—",
      ltv: "R$ 0",
    },
  },
];

const VOLUME: VolumePoint[] = [
  { day: "Seg", ai: 60, human: 8 },
  { day: "Ter", ai: 75, human: 10 },
  { day: "Qua", ai: 82, human: 12 },
  { day: "Qui", ai: 90, human: 14 },
  { day: "Sex", ai: 110, human: 18 },
  { day: "Sáb", ai: 130, human: 24 },
  { day: "Dom", ai: 92, human: 15 },
];

const INTENTS: IntentRow[] = [
  { label: "Agendar horário", pct: 42 },
  { label: "Horário/endereço", pct: 28 },
  { label: "Preços", pct: 17 },
  { label: "Pedido/entrega", pct: 9 },
  { label: "Outros", pct: 4 },
];

const METRICS: Metric[] = [
  { key: "conversations", label: "Conversas hoje", value: "127", delta: "+12%", icon: "inbox" },
  { key: "automation", label: "Respondidas pela IA", value: "94%", delta: "+3 pp", icon: "spark" },
  { key: "avgTime", label: "Tempo médio", value: "14s", delta: "-8s", icon: "clock" },
  { key: "bookings", label: "Agendamentos", value: "23", delta: "+5", icon: "calendar" },
];


const SETTINGS: SettingsPage = {
  plan: { name: "Negócio", price: "R$ 149/mês", renewsAt: "17/mai" },
  team: { invitedCount: 0 },
};

/* ------------------------------------------------------------ helpers */

function formatKnowledgeMeta(k: {
  kind: string;
  sizeBytes: number;
  mimeType: string | null;
}): string {
  const { kind, sizeBytes, mimeType } = k;
  const sizeStr =
    sizeBytes <= 0
      ? null
      : sizeBytes < 1024
        ? `${sizeBytes} B`
        : `${(sizeBytes / 1024).toFixed(0)} KB`;
  if (kind === "text") return sizeStr ? `Texto · ${sizeStr}` : "Texto";
  if (kind === "url") return "Site";
  const ext =
    mimeType?.split("/").pop()?.replace("vnd.openxmlformats-officedocument.wordprocessingml.document", "DOCX")?.toUpperCase() ??
    "Arquivo";
  return sizeStr ? `${ext} · ${sizeStr}` : ext;
}

/* ------------------------------------------------------------ fetchers */

export async function getOverview(
  from?: string,
  to?: string,
): Promise<DashboardOverview> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return serverFetch<DashboardOverview>(
    `/dashboard/overview${qs ? `?${qs}` : ""}`,
  );
}

export async function listConversations(): Promise<Conversation[]> {
  return CONVERSATIONS;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return CONVERSATIONS.find((c) => c.id === id) ?? null;
}

export async function getAssistantPage(): Promise<AssistantPage> {
  const data = await serverFetch<{
    business: BusinessProfile | null;
    assistant: AssistantFull & { publishedAt: string | null };
    stats: { totalConversations: number; automationPct: number };
    knowledge: Array<{
      id: string;
      title: string;
      kind: string;
      sizeBytes: number;
      mimeType: string | null;
    }>;
  }>("/onboarding/me");

  const asst = data.assistant;
  const biz = data.business;

  const assistant: AssistantSummary = {
    name: asst?.name ?? "Lia",
    businessName: biz?.name ?? "seu negócio",
    publishedAt: asst?.publishedAt ?? null,
    totalConversations: data.stats.totalConversations,
    automationPct: data.stats.automationPct,
    greeting: asst?.greeting ?? "",
  };

  const assistantFull: AssistantFull = asst ?? {
    name: "Lia",
    tone: "descolada",
    avatar: 0,
    greeting: "",
    permissions: {
      scheduling: true,
      payments: true,
      handoff: true,
      discounts: false,
    },
  };

  const business: BusinessProfile = biz ?? {
    name: "",
    category: "",
    phone: "",
    address: "",
    hoursFrom: "09:00",
    hoursTo: "18:00",
    weekend: "",
    description: "",
  };

  const knowledge: KnowledgeRow[] = data.knowledge.map((k) => ({
    id: k.id,
    name: k.title || k.kind,
    meta: formatKnowledgeMeta(k),
    ok: k.sizeBytes > 0,
    kind: k.kind,
  }));

  return { assistant, assistantFull, business, knowledge };
}

export async function getSettings(): Promise<SettingsPage> {
  return SETTINGS;
}
