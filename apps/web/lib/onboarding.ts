import { apiFetch } from "./api";
import type { KnowledgeItem } from "./knowledge";
import type { WhatsappStatus } from "./whatsapp";

export type OnboardingWeekend = "" | "sim" | "sabado" | "nao";

export type OnboardingTone =
  | "descolada"
  | "amigavel"
  | "profissional"
  | "divertida";

export interface OnboardingBusiness {
  name: string;
  category: string;
  phone: string;
  address: string;
  hoursFrom: string;
  hoursTo: string;
  weekend: OnboardingWeekend;
  description: string;
}

export interface OnboardingAssistantPermissions {
  scheduling: boolean;
  payments: boolean;
  handoff: boolean;
  discounts: boolean;
}

export interface OnboardingAssistant {
  name: string;
  tone: OnboardingTone;
  avatar: number;
  greeting: string;
  permissions: OnboardingAssistantPermissions;
}

export interface OnboardingAssistantResponse extends OnboardingAssistant {
  published: boolean;
  publishedAt: string | null;
}

export interface OnboardingWhatsappSummary {
  id: string;
  status: WhatsappStatus;
  phoneNumber: string | null;
  profileName: string | null;
}

export interface OnboardingState {
  business: OnboardingBusiness | null;
  assistant: OnboardingAssistantResponse | null;
  whatsapp: OnboardingWhatsappSummary | null;
  knowledge: KnowledgeItem[];
  completed: boolean;
  completedAt: string | null;
}

export function getOnboardingState() {
  return apiFetch<OnboardingState>("/onboarding/me", { method: "GET" });
}

export function saveOnboardingBusiness(body: OnboardingBusiness) {
  return apiFetch<OnboardingBusiness>("/onboarding/business", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function saveOnboardingAssistant(body: OnboardingAssistant) {
  return apiFetch<OnboardingAssistantResponse>("/onboarding/assistant", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function completeOnboarding() {
  return apiFetch<{ ok: true; completedAt: string }>("/onboarding/complete", {
    method: "POST",
  });
}
