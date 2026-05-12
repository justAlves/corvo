export type ObStep = { k: string; label: string };

export const ONBOARDING_STEPS: ObStep[] = [
  { k: "01", label: "WhatsApp" },
  { k: "02", label: "Negócio" },
  { k: "03", label: "Personalidade" },
  { k: "04", label: "Testar" },
];

export const BUSINESS_CATEGORIES = [
  "Clínica/Saúde",
  "Restaurante",
  "Pet shop",
  "Estética/Beleza",
  "E-commerce",
  "Imobiliária",
  "Loja física",
  "Serviços",
  "Outro",
] as const;

export const WEEKEND_OPTIONS = ["Sim", "Só sábado", "Não"] as const;
export type WeekendOption = (typeof WEEKEND_OPTIONS)[number];

export type WeekendServerValue = "" | "sim" | "sabado" | "nao";

export const WEEKEND_LABEL_TO_SERVER: Record<WeekendOption, WeekendServerValue> =
  {
    Sim: "sim",
    "Só sábado": "sabado",
    Não: "nao",
  };

export const WEEKEND_SERVER_TO_LABEL: Record<
  Exclude<WeekendServerValue, "">,
  WeekendOption
> = {
  sim: "Sim",
  sabado: "Só sábado",
  nao: "Não",
};

export const PERMISSION_KEYS = [
  "scheduling",
  "payments",
  "handoff",
  "discounts",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type AssistantTone = "descolada" | "amigavel" | "profissional" | "divertida";

export const ASSISTANT_TONES: {
  k: AssistantTone;
  label: string;
  sample: string;
}[] = [
  { k: "descolada", label: "Descolada", sample: "Oi oi! Cheguei 🌿 Como posso ajudar hoje?" },
  { k: "amigavel", label: "Amigável", sample: "Oi! Como posso te ajudar?" },
  { k: "profissional", label: "Profissional", sample: "Olá. Em que posso ajudá-lo?" },
  { k: "divertida", label: "Divertida", sample: "Opa! Chegou no lugar certo — manda a dúvida aí!" },
];

export type AssistantAvatar = { bg: string; face: string };

export const ASSISTANT_AVATARS: AssistantAvatar[] = [
  { bg: "oklch(0.8 0.14 30)", face: "🌿" },
  { bg: "oklch(0.8 0.14 200)", face: "◐" },
  { bg: "oklch(0.78 0.19 145)", face: "✳" },
  { bg: "oklch(0.8 0.14 295)", face: "✦" },
  { bg: "oklch(0.8 0.14 110)", face: "☀" },
  { bg: "oklch(0.2 0.01 250)", face: "◆" },
];

export const DEFAULT_PERMISSIONS: { label: string; on: boolean }[] = [
  { label: "Agendar horários na agenda", on: true },
  { label: "Gerar links de pagamento", on: true },
  { label: "Passar pro atendente humano quando complicar", on: true },
  { label: "Oferecer descontos sem autorização", on: false },
];

export const PLAYGROUND_SUGGESTIONS = [
  "Vocês abrem hoje?",
  "Qual o endereço?",
  "Quero agendar um horário",
  "Quanto custa?",
] as const;
