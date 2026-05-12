/**
 * Dashboard data layer.
 *
 * All UI reads from these typed fetchers. Mock data lives here for now;
 * swap each function body for an `apiFetch<T>("/...")` call once the
 * backend lands. Keep the return shapes stable so the components don't
 * need to change.
 */

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
}

export interface AssistantSummary {
  name: string;
  business: string;
  activeFor: string;
  conversations: number;
  automation: number;
  avgSeconds: number;
  greeting: string;
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

const KNOWLEDGE: KnowledgeRow[] = [
  { id: "profile", name: "Perfil do negócio", meta: "auto", ok: true },
  { id: "hours", name: "Horário e endereço", meta: "auto", ok: true },
  { id: "menu", name: "Cardápio / catálogo", meta: "24 itens · PDF", ok: true },
  { id: "faq", name: "FAQ", meta: "18 perguntas", ok: true },
  { id: "calendar", name: "Integração Google Calendar", meta: "conectado", ok: true },
  { id: "payments", name: "Gateway de pagamento", meta: "pendente", ok: false },
];

const ASSISTANT: AssistantSummary = {
  name: "Lia",
  business: "seu negócio",
  activeFor: "Ativa há 3 dias",
  conversations: 412,
  automation: 94,
  avgSeconds: 14,
  greeting:
    "Oi! Aqui é a Lia, assistente do {business}. Como posso te ajudar hoje? 💚",
};

const SETTINGS: SettingsPage = {
  plan: { name: "Negócio", price: "R$ 149/mês", renewsAt: "17/mai" },
  team: { invitedCount: 0 },
};

/* ------------------------------------------------------------ fetchers */

export async function getOverview(): Promise<DashboardOverview> {
  return {
    greetingName: "Corvo",
    metrics: METRICS,
    volume: VOLUME,
    intents: INTENTS,
    recent: CONVERSATIONS.slice(0, 4),
  };
}

export async function listConversations(): Promise<Conversation[]> {
  return CONVERSATIONS;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return CONVERSATIONS.find((c) => c.id === id) ?? null;
}

export async function getAssistantPage(): Promise<AssistantPage> {
  return { assistant: ASSISTANT, knowledge: KNOWLEDGE };
}

export async function getSettings(): Promise<SettingsPage> {
  return SETTINGS;
}
