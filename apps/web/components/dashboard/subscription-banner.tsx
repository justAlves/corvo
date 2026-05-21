"use client";

import { AlertCircle, Clock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  getMySubscription,
  periodDaysRemaining,
  trialDaysRemaining,
  type SubscriptionInfo,
} from "@/lib/billing";

export function SubscriptionBanner() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getMySubscription().then(setInfo).catch(() => null);
  }, []);

  if (!info || dismissed) return null;

  const { status, trialEndsAt, currentPeriodEndsAt } = info;

  if (status === "active" || status === "cancelled" || status === "expired") return null;

  const isTrial = status === "trial";
  const isCancelPending = status === "cancel_at_period_end";

  const days = isTrial
    ? trialDaysRemaining(trialEndsAt)
    : periodDaysRemaining(currentPeriodEndsAt);

  const isUrgent = days <= 3;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-2.5 text-xs",
        isUrgent
          ? "bg-destructive/10 text-destructive"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      )}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertCircle className="size-3.5 shrink-0" />
        ) : (
          <Clock className="size-3.5 shrink-0" />
        )}
        {isTrial && (
          <span>
            Período gratuito:{" "}
            <strong>
              {days} {days === 1 ? "dia restante" : "dias restantes"}
            </strong>.{" "}
            <Link
              href="/dashboard/billing"
              className="font-medium underline underline-offset-2"
            >
              Assine agora
            </Link>{" "}
            para não perder acesso.
          </span>
        )}
        {isCancelPending && (
          <span>
            Assinatura cancelada. Acesso mantido por mais{" "}
            <strong>{days} {days === 1 ? "dia" : "dias"}</strong>.{" "}
            <Link
              href="/dashboard/billing"
              className="font-medium underline underline-offset-2"
            >
              Reativar
            </Link>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-60 hover:opacity-100"
        aria-label="Fechar aviso"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
