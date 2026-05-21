import { apiFetch } from "./api";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "cancel_at_period_end"
  | "cancelled"
  | "expired";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  cancelledAt: string | null;
  hasSubscription: boolean;
}

export function getMySubscription() {
  return apiFetch<SubscriptionInfo>("/billing/me", { method: "GET" });
}

export function createSubscriptionCheckout() {
  return apiFetch<{ url: string }>("/billing/checkout", { method: "POST" });
}

export function cancelSubscription() {
  return apiFetch<{ ok: boolean; accessUntil: string | null }>("/billing/cancel", {
    method: "POST",
  });
}

export function reactivateSubscription() {
  return apiFetch<{ url: string }>("/billing/reactivate", { method: "POST" });
}

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === "trial" || status === "active" || status === "cancel_at_period_end";
}

export function statusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "trial":
      return "Período gratuito";
    case "active":
      return "Ativo";
    case "cancel_at_period_end":
      return "Cancelamento agendado";
    case "cancelled":
      return "Cancelado";
    case "expired":
      return "Trial expirado";
  }
}

export function trialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000));
}

export function periodDaysRemaining(currentPeriodEndsAt: string | null): number {
  if (!currentPeriodEndsAt) return 0;
  return Math.max(0, Math.ceil((new Date(currentPeriodEndsAt).getTime() - Date.now()) / 86_400_000));
}
