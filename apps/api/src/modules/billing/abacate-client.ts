import { createHmac } from "node:crypto";
import { env } from "../../config/env";

const BASE = "https://api.abacatepay.com/v2";

class AbacateError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AbacateError";
    this.status = status;
  }
}

async function abacateFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ABACATEPAY_API_KEY}`,
      ...(init.headers ?? {}),
    },
  });
  const json = (await res.json()) as { data: T; success: boolean; error: string | null };
  if (!res.ok || !json.success) {
    throw new AbacateError(res.status, json.error ?? `AbacatePay ${res.status} on ${path}`);
  }
  return json.data;
}

export interface AbacateCustomer {
  id: string;
  email: string;
  name?: string;
  taxId?: string;
}

export interface AbacateSubscriptionCheckout {
  id: string;
  url: string;
  status: string;
  externalId?: string;
}

export interface AbacateSubscription {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "EXPIRED" | "REFUNDED";
  customerId: string;
  nextBillingDate?: string;
  currentPeriodEnd?: string;
}

export async function createOrGetCustomer(params: {
  email: string;
  name?: string;
  taxId?: string;
}): Promise<AbacateCustomer> {
  return abacateFetch<AbacateCustomer>("/customers/create", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      name: params.name,
      taxId: params.taxId,
    }),
  });
}

export async function createSubscriptionCheckout(params: {
  customerId: string;
  productId: string;
  externalId: string;
  trialDays?: number;
  returnUrl?: string;
  completionUrl?: string;
}): Promise<AbacateSubscriptionCheckout> {
  return abacateFetch<AbacateSubscriptionCheckout>("/subscriptions/create", {
    method: "POST",
    body: JSON.stringify({
      items: [{ id: params.productId, quantity: 1 }],
      customerId: params.customerId,
      externalId: params.externalId,
      returnUrl: params.returnUrl,
      completionUrl: params.completionUrl,
      // trialDays is passed if reactivating within a paid period
      ...(params.trialDays && params.trialDays > 0 ? { trialDays: params.trialDays } : {}),
    }),
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await abacateFetch("/subscriptions/cancel", {
    method: "POST",
    body: JSON.stringify({ id: subscriptionId }),
  });
}

// Verifies the HMAC-SHA256 signature sent by AbacatePay on webhooks.
// Header name to verify: check AbacatePay dashboard — commonly "x-webhook-signature".
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // Constant-time comparison to avoid timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
