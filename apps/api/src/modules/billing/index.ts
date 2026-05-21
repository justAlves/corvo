import { and, eq } from "drizzle-orm";
import Elysia from "elysia";

import { drizzle } from "../../config/db";
import { env } from "../../config/env";
import { subscription } from "../../shared/tables/subscription.table";
import { user } from "../../shared/tables/user.table";
import { AuthGuard } from "../auth";
import {
  cancelSubscription,
  createOrGetCustomer,
  createSubscriptionCheckout,
  verifyWebhookSignature,
} from "./abacate-client";

const TRIAL_MS = env.TRIAL_DAYS * 24 * 60 * 60 * 1000;

function resolveEffectiveStatus(
  row: typeof subscription.$inferSelect,
): "trial" | "active" | "cancel_at_period_end" | "cancelled" | "expired" {
  if (row.status === "trial") {
    const trialOver = row.trialEndsAt && row.trialEndsAt < new Date();
    return trialOver ? "expired" : "trial";
  }
  if (row.status === "cancel_at_period_end") {
    const periodOver = row.currentPeriodEndsAt && row.currentPeriodEndsAt < new Date();
    return periodOver ? "cancelled" : "cancel_at_period_end";
  }
  return row.status;
}

async function getOrCreateSubscription(userId: string) {
  const [existing] = await drizzle
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (existing) return existing;

  const trialEndsAt = new Date(Date.now() + TRIAL_MS);
  const [created] = await drizzle
    .insert(subscription)
    .values({ userId, status: "trial", trialEndsAt })
    .returning();
  return created!;
}

export const BillingModule = new Elysia({ name: "billing/module" })
  // ── GET /billing/me ─────────────────────────────────────────────────────────
  .use(AuthGuard)
  .get(
    "/billing/me",
    async ({ user: sessionUser }) => {
      const row = await getOrCreateSubscription(sessionUser.id);
      const effectiveStatus = resolveEffectiveStatus(row);
      return {
        status: effectiveStatus,
        trialEndsAt: row.trialEndsAt?.toISOString() ?? null,
        currentPeriodEndsAt: row.currentPeriodEndsAt?.toISOString() ?? null,
        cancelledAt: row.cancelledAt?.toISOString() ?? null,
        hasSubscription: !!row.abacateSubscriptionId,
      };
    },
    { auth: true },
  )

  // ── POST /billing/checkout ───────────────────────────────────────────────────
  // Returns an AbacatePay checkout URL for the user to subscribe.
  .post(
    "/billing/checkout",
    async ({ user: sessionUser, set }) => {
      const [userRow] = await drizzle
        .select()
        .from(user)
        .where(eq(user.id, sessionUser.id))
        .limit(1);
      if (!userRow) return set.status = 404;

      const row = await getOrCreateSubscription(sessionUser.id);
      const effectiveStatus = resolveEffectiveStatus(row);

      if (effectiveStatus === "active") {
        set.status = 400;
        return { message: "Assinatura já está ativa." };
      }

      // Create/retrieve customer on AbacatePay
      const customer = await createOrGetCustomer({
        email: userRow.email,
        name: userRow.name ?? undefined,
      });

      // For reactivation before period end, offer trial for remaining days
      let trialDays: number | undefined;
      if (
        effectiveStatus === "cancel_at_period_end" &&
        row.currentPeriodEndsAt &&
        row.currentPeriodEndsAt > new Date()
      ) {
        trialDays = Math.ceil(
          (row.currentPeriodEndsAt.getTime() - Date.now()) / 86_400_000,
        );
      }

      const checkout = await createSubscriptionCheckout({
        customerId: customer.id,
        productId: env.ABACATEPAY_PRODUCT_ID,
        externalId: sessionUser.id,
        trialDays,
        completionUrl: `${env.PUBLIC_WEBHOOK_URL.replace("/billing/webhook", "")}/dashboard/billing?success=1`,
        returnUrl: `${env.PUBLIC_WEBHOOK_URL.replace("/billing/webhook", "")}/dashboard/billing`,
      });

      // Persist customer ID so webhook can find the user later
      await drizzle
        .update(subscription)
        .set({ abacateCustomerId: customer.id })
        .where(eq(subscription.userId, sessionUser.id));

      return { url: checkout.url };
    },
    { auth: true },
  )

  // ── POST /billing/cancel ─────────────────────────────────────────────────────
  .post(
    "/billing/cancel",
    async ({ user: sessionUser, set }) => {
      const row = await getOrCreateSubscription(sessionUser.id);
      const effectiveStatus = resolveEffectiveStatus(row);

      if (effectiveStatus !== "active") {
        set.status = 400;
        return { message: "Assinatura não está ativa." };
      }

      if (!row.abacateSubscriptionId) {
        set.status = 400;
        return { message: "Nenhuma assinatura encontrada." };
      }

      // Cancel on AbacatePay immediately; user keeps access until currentPeriodEndsAt
      await cancelSubscription(row.abacateSubscriptionId);

      await drizzle
        .update(subscription)
        .set({ status: "cancel_at_period_end", cancelledAt: new Date() })
        .where(eq(subscription.userId, sessionUser.id));

      return { ok: true, accessUntil: row.currentPeriodEndsAt?.toISOString() ?? null };
    },
    { auth: true },
  )

  // ── POST /billing/reactivate ─────────────────────────────────────────────────
  // Returns a new checkout URL if within the grace period; status updates via webhook.
  .post(
    "/billing/reactivate",
    async ({ user: sessionUser, set }) => {
      const row = await getOrCreateSubscription(sessionUser.id);
      const effectiveStatus = resolveEffectiveStatus(row);

      if (effectiveStatus !== "cancel_at_period_end") {
        set.status = 400;
        return { message: "Assinatura não está em cancelamento agendado." };
      }

      const [userRow] = await drizzle
        .select()
        .from(user)
        .where(eq(user.id, sessionUser.id))
        .limit(1);
      if (!userRow) { set.status = 404; return; }

      const customer = await createOrGetCustomer({
        email: userRow.email,
        name: userRow.name ?? undefined,
      });

      const daysRemaining = row.currentPeriodEndsAt
        ? Math.ceil((row.currentPeriodEndsAt.getTime() - Date.now()) / 86_400_000)
        : 0;

      const checkout = await createSubscriptionCheckout({
        customerId: customer.id,
        productId: env.ABACATEPAY_PRODUCT_ID,
        externalId: sessionUser.id,
        trialDays: daysRemaining > 0 ? daysRemaining : undefined,
        completionUrl: `${env.PUBLIC_WEBHOOK_URL.replace("/billing/webhook", "")}/dashboard/billing?reactivated=1`,
        returnUrl: `${env.PUBLIC_WEBHOOK_URL.replace("/billing/webhook", "")}/dashboard/billing`,
      });

      return { url: checkout.url };
    },
    { auth: true },
  )

  // ── POST /billing/webhook ────────────────────────────────────────────────────
  // Public endpoint — authenticated via HMAC signature, not session.
  // Body is parsed as raw text so we can verify HMAC before parsing JSON.
  .post(
    "/billing/webhook",
    async ({ body, headers, set }) => {
      const rawBody = body as string;
      // AbacatePay sends signature in this header — confirm name in their dashboard
      const sig = headers["x-webhook-signature"] ?? "";

      if (!verifyWebhookSignature(rawBody, sig, env.ABACATEPAY_WEBHOOK_SECRET)) {
        set.status = 401;
        return { error: "Invalid signature" };
      }

      const payload = JSON.parse(rawBody) as {
        event: string;
        data: {
          subscription?: {
            id: string;
            status: string;
            externalId?: string;
            customerId?: string;
            // ISO date strings — field names to confirm in AbacatePay dashboard
            nextBillingDate?: string;
            currentPeriodEnd?: string;
          };
        };
      };

      const sub = payload.data?.subscription;
      if (!sub) return { ok: true };

      const userId = sub.externalId;
      if (!userId) return { ok: true };

      const [row] = await drizzle
        .select()
        .from(subscription)
        .where(eq(subscription.userId, userId))
        .limit(1);

      if (!row) return { ok: true };

      const periodEnd = sub.nextBillingDate ?? sub.currentPeriodEnd;
      const currentPeriodEndsAt = periodEnd ? new Date(periodEnd) : undefined;

      switch (payload.event) {
        case "subscription.trial_started":
          await drizzle
            .update(subscription)
            .set({
              abacateSubscriptionId: sub.id,
              abacateCustomerId: sub.customerId ?? row.abacateCustomerId,
              status: "trial",
              ...(currentPeriodEndsAt ? { currentPeriodEndsAt } : {}),
            })
            .where(eq(subscription.userId, userId));
          break;

        case "subscription.completed":
          await drizzle
            .update(subscription)
            .set({
              abacateSubscriptionId: sub.id,
              abacateCustomerId: sub.customerId ?? row.abacateCustomerId,
              status: "active",
              trialEndsAt: null,
              cancelledAt: null,
              ...(currentPeriodEndsAt ? { currentPeriodEndsAt } : {}),
            })
            .where(eq(subscription.userId, userId));
          break;

        case "subscription.renewed":
          await drizzle
            .update(subscription)
            .set({
              status: "active",
              ...(currentPeriodEndsAt ? { currentPeriodEndsAt } : {}),
            })
            .where(eq(subscription.userId, userId));
          break;

        case "subscription.cancelled":
          await drizzle
            .update(subscription)
            .set({ status: "cancelled" })
            .where(eq(subscription.userId, userId));
          break;
      }

      return { ok: true };
    },
    { type: "text" },
  );

// Exported helper for other modules to check subscription access
export async function assertSubscriptionActive(userId: string): Promise<boolean> {
  const [row] = await drizzle
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (!row) {
    // No row = new user; create trial
    const trialEndsAt = new Date(Date.now() + TRIAL_MS);
    await drizzle.insert(subscription).values({ userId, status: "trial", trialEndsAt });
    return true;
  }

  const status = resolveEffectiveStatus(row);
  return status === "trial" || status === "active" || status === "cancel_at_period_end";
}
