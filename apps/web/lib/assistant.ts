import { apiFetch } from "./api";

export interface BusinessProfileData {
  name: string;
  category: string;
  phone: string;
  address: string;
  hoursFrom: string;
  hoursTo: string;
  weekend: "" | "sim" | "sabado" | "nao";
  description: string;
}

export interface AssistantFullData {
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

export function saveBusiness(data: BusinessProfileData) {
  return apiFetch<BusinessProfileData>("/onboarding/business", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function saveAssistant(data: AssistantFullData) {
  return apiFetch<AssistantFullData>("/onboarding/assistant", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function saveKnowledgeText(title: string, content: string) {
  return apiFetch("/onboarding/knowledge/text", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
}

export function fetchKnowledgeContent(id: string) {
  return apiFetch<{ id: string; title: string; kind: string; content: string }>(
    `/onboarding/knowledge/${id}`,
  );
}

export function deleteKnowledge(id: string) {
  return apiFetch(`/onboarding/knowledge/${id}`, { method: "DELETE" });
}

export async function uploadKnowledgePdf(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${(await import("./api")).API_BASE}/onboarding/knowledge/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Upload falhou (${res.status})`);
  }
  return res.json();
}
