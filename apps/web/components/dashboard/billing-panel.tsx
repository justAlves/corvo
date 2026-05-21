"use client";

import { AlertCircle, CheckCircle2, Clock, CreditCard, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  cancelSubscription,
  createSubscriptionCheckout,
  getMySubscription,
  periodDaysRemaining,
  reactivateSubscription,
  statusLabel,
  trialDaysRemaining,
  type SubscriptionInfo,
  type SubscriptionStatus,
} from "@/lib/billing";

const STATUS_ICON: Record<SubscriptionStatus, React.ReactNode> = {
  trial: <Clock className="size-4 text-amber-500" />,
  active: <CheckCircle2 className="size-4 text-accent" />,
  cancel_at_period_end: <AlertCircle className="size-4 text-amber-500" />,
  cancelled: <XCircle className="size-4 text-destructive" />,
  expired: <XCircle className="size-4 text-destructive" />,
};

const STATUS_BADGE_VARIANT: Record<SubscriptionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  trial: "secondary",
  active: "default",
  cancel_at_period_end: "secondary",
  cancelled: "destructive",
  expired: "destructive",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function BillingPanel() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"subscribe" | "cancel" | "reactivate" | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getMySubscription();
      setInfo(data);
    } catch {
      toast.error("Não foi possível carregar o plano.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSubscribe() {
    setBusy("subscribe");
    try {
      const { url } = await createSubscriptionCheckout();
      window.location.href = url;
    } catch {
      toast.error("Erro ao criar checkout. Tente novamente.");
      setBusy(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Tem certeza? Você ainda poderá usar a plataforma até o fim do período atual.")) return;
    setBusy("cancel");
    try {
      await cancelSubscription();
      toast.success("Assinatura cancelada. Acesso mantido até o fim do período.");
      await refresh();
    } catch {
      toast.error("Erro ao cancelar. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function handleReactivate() {
    setBusy("reactivate");
    try {
      const { url } = await reactivateSubscription();
      window.location.href = url;
    } catch {
      toast.error("Erro ao reativar. Tente novamente.");
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-line bg-card p-8">
        <Loader2 className="size-5 animate-spin text-ink-3" />
      </div>
    );
  }

  if (!info) return null;

  const { status, trialEndsAt, currentPeriodEndsAt } = info;
  const daysLeft =
    status === "trial"
      ? trialDaysRemaining(trialEndsAt)
      : periodDaysRemaining(currentPeriodEndsAt);

  return (
    <section className="rounded-lg border border-line bg-card p-[22px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-ink-2" />
            <span className="text-sm font-semibold">Plano & Assinatura</span>
          </div>
          <p className="mt-0.5 text-xs text-ink-3">
            Gerencie seu plano Corvo.
          </p>
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[status]} className="flex items-center gap-1.5">
          {STATUS_ICON[status]}
          {statusLabel(status)}
        </Badge>
      </div>

      <Separator className="my-4" />

      {/* Trial */}
      {status === "trial" && (
        <div className="space-y-3">
          <p className="text-sm text-ink-2">
            Você está no período gratuito.{" "}
            <strong className="text-ink">{daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}</strong>{" "}
            (até {formatDate(trialEndsAt)}).
          </p>
          <p className="text-xs text-ink-3">
            Assine antes do fim do trial para continuar usando sem interrupção.
          </p>
          <Button size="sm" onClick={handleSubscribe} disabled={busy === "subscribe"}>
            {busy === "subscribe" && <Loader2 className="size-3.5 animate-spin" />}
            Assinar agora — R$ 149/mês
          </Button>
        </div>
      )}

      {/* Active */}
      {status === "active" && (
        <div className="space-y-3">
          <p className="text-sm text-ink-2">
            Assinatura ativa. Próxima cobrança em{" "}
            <strong className="text-ink">{formatDate(currentPeriodEndsAt)}</strong>.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={busy === "cancel"}
            className="text-destructive hover:text-destructive"
          >
            {busy === "cancel" && <Loader2 className="size-3.5 animate-spin" />}
            Cancelar assinatura
          </Button>
        </div>
      )}

      {/* Cancel at period end */}
      {status === "cancel_at_period_end" && (
        <div className="space-y-3">
          <p className="text-sm text-ink-2">
            Cancelamento agendado. Você ainda tem acesso por{" "}
            <strong className="text-ink">{daysLeft} {daysLeft === 1 ? "dia" : "dias"}</strong>{" "}
            (até {formatDate(currentPeriodEndsAt)}).
          </p>
          <p className="text-xs text-ink-3">
            Reative antes do vencimento para continuar sem ser cobrado novamente pelo período atual.
          </p>
          <Button size="sm" onClick={handleReactivate} disabled={busy === "reactivate"}>
            {busy === "reactivate" && <Loader2 className="size-3.5 animate-spin" />}
            Reativar assinatura
          </Button>
        </div>
      )}

      {/* Cancelled / Expired */}
      {(status === "cancelled" || status === "expired") && (
        <div className="space-y-3">
          <p className="text-sm text-ink-2">
            {status === "expired"
              ? "Seu período gratuito terminou."
              : "Sua assinatura foi cancelada."}{" "}
            Assine para retomar o acesso à plataforma.
          </p>
          <Button size="sm" onClick={handleSubscribe} disabled={busy === "subscribe"}>
            {busy === "subscribe" && <Loader2 className="size-3.5 animate-spin" />}
            Assinar agora — R$ 149/mês
          </Button>
        </div>
      )}
    </section>
  );
}
