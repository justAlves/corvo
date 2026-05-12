import { apiFetch } from "./api";

export type WhatsappStatus =
  | "pending"
  | "connecting"
  | "connected"
  | "disconnected";

export interface WhatsappInstance {
  id: string;
  instanceName: string;
  status: WhatsappStatus;
  qrCode: string | null;
  pairingCode: string | null;
  phoneNumber: string | null;
}

export function createWhatsappInstance() {
  return apiFetch<WhatsappInstance>("/whatsapp/instance", { method: "POST" });
}

export function getMyWhatsappInstance() {
  return apiFetch<WhatsappInstance>("/whatsapp/instance/me", { method: "GET" });
}

export function deleteMyWhatsappInstance() {
  return apiFetch<{ ok: boolean }>("/whatsapp/instance", { method: "DELETE" });
}

export function reconnectWhatsappInstance() {
  return apiFetch<WhatsappInstance>("/whatsapp/instance/reconnect", {
    method: "POST",
  });
}

export function refreshWhatsappWebhook() {
  return apiFetch<{ ok: boolean; url: string; events: string[] }>(
    "/whatsapp/instance/refresh-webhook",
    { method: "POST" },
  );
}
