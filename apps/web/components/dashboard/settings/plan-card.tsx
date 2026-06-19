"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { authClient } from "@/lib/authClient";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BillingInfo {
  status: "trial" | "active" | "cancel_at_period_end" | "cancelled" | "expired";
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  cancelledAt: string | null;
  hasSubscription: boolean;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<BillingInfo["status"], string> = {
  trial: "Trial gratuito",
  active: "Plano ativo",
  cancel_at_period_end: "Cancelamento agendado",
  cancelled: "Sem plano",
  expired: "Trial expirado",
};

export function PlanCard() {
  const router = useRouter();
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    apiFetch<BillingInfo>("/billing/me")
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe() {
    setActionBusy(true);
    try {
      const { url } = await apiFetch<{ url: string }>("/billing/checkout", { method: "POST" });
      window.location.href = url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao iniciar assinatura.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleCancel() {
    setActionBusy(true);
    try {
      await apiFetch("/billing/cancel", { method: "POST" });
      const updated = await apiFetch<BillingInfo>("/billing/me");
      setInfo(updated);
      setConfirmCancel(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao cancelar.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReactivate() {
    setActionBusy(true);
    try {
      const { url } = await apiFetch<{ url: string }>("/billing/reactivate", { method: "POST" });
      window.location.href = url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao reativar.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <section className="rounded-lg border border-line bg-card p-[22px]">
      {/* Plan */}
      <div className="text-sm font-semibold">Plano</div>

      {loading ? (
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-surface-2" />
      ) : !info ? (
        <p className="mt-1 text-xs text-ink-3">Não foi possível carregar o plano.</p>
      ) : (
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <StatusChip status={info.status} />
            </div>
            <p className="mt-1.5 text-xs text-ink-3">
              {info.status === "trial" && (
                <>Trial gratuito até <strong>{fmtDate(info.trialEndsAt)}</strong>. Assine para continuar após esse período.</>
              )}
              {info.status === "active" && (
                <>Renovação automática em <strong>{fmtDate(info.currentPeriodEndsAt)}</strong>.</>
              )}
              {info.status === "cancel_at_period_end" && (
                <>Assinatura cancelada. Você ainda tem acesso até <strong>{fmtDate(info.currentPeriodEndsAt)}</strong>.</>
              )}
              {(info.status === "cancelled" || info.status === "expired") && (
                <>Você não tem uma assinatura ativa. Assine para usar o serviço.</>
              )}
            </p>
          </div>

          <div className="shrink-0">
            {(info.status === "trial" || info.status === "cancelled" || info.status === "expired") && (
              <Button size="sm" onClick={handleSubscribe} disabled={actionBusy}>
                {actionBusy ? "Aguarde…" : "Assinar agora"}
              </Button>
            )}

            {info.status === "active" && !confirmCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmCancel(true)}
                disabled={actionBusy}
              >
                Cancelar assinatura
              </Button>
            )}

            {info.status === "active" && confirmCancel && (
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-ink-3">Tem certeza?</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)} disabled={actionBusy}>
                    Não
                  </Button>
                  <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10" onClick={handleCancel} disabled={actionBusy}>
                    {actionBusy ? "Cancelando…" : "Sim, cancelar"}
                  </Button>
                </div>
              </div>
            )}

            {info.status === "cancel_at_period_end" && (
              <Button size="sm" onClick={handleReactivate} disabled={actionBusy}>
                {actionBusy ? "Aguarde…" : "Reativar"}
              </Button>
            )}
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Sign out */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Conta</div>
          <p className="mt-0.5 text-xs text-ink-3">Encerrar sessão neste dispositivo</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSignOut}>
          <LogOut className="size-3.5" />
          Sair da conta
        </Button>
      </div>
    </section>
  );
}

function StatusChip({ status }: { status: BillingInfo["status"] }) {
  const colors: Record<BillingInfo["status"], string> = {
    trial: "bg-amber-500/15 text-amber-600",
    active: "bg-accent/15 text-accent",
    cancel_at_period_end: "bg-orange-500/15 text-orange-600",
    cancelled: "bg-surface-2 text-ink-3",
    expired: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
