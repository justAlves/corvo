import { API_BASE, ApiError, apiFetch } from "./api";

export type KnowledgeKind = "url" | "file" | "text";

export interface KnowledgeItem {
  id: string;
  kind: KnowledgeKind;
  title: string;
  sourceUrl: string | null;
  mimeType: string | null;
  sizeBytes: number;
  preview: string;
  createdAt: string;
}

export function listKnowledge() {
  return apiFetch<{ items: KnowledgeItem[] }>("/onboarding/knowledge", {
    method: "GET",
  });
}

export function importKnowledgeUrl(url: string) {
  return apiFetch<KnowledgeItem>("/onboarding/knowledge/url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function uploadKnowledgeFile(file: File): Promise<KnowledgeItem> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/onboarding/knowledge/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const text = await res.text();
  const body = text ? safeParse(text) : null;
  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : null) ?? `Upload falhou (${res.status})`;
    throw new ApiError(res.status, body, msg);
  }
  return body as KnowledgeItem;
}

export function deleteKnowledge(id: string) {
  return apiFetch<{ ok: true }>(
    `/onboarding/knowledge/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
