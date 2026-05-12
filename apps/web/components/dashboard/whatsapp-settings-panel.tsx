"use client";

import { Power, RefreshCcw, Webhook } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  deleteMyWhatsappInstance,
  getMyWhatsappInstance,
  reconnectWhatsappInstance,
  refreshWhatsappWebhook,
  type WhatsappInstance,
  type WhatsappStatus,
} from "@/lib/whatsapp";

const POLL_MS = 4000;

const STATUS_LABEL: Record<WhatsappStatus, string> = {
  connected: "Conectado",
  connecting: "Conectando",
  pending: "Aguardando QR",
  disconnected: "Desconectado",
};

const STATUS_DOT: Record<WhatsappStatus, string> = {
  connected: "bg-accent",
  connecting: "bg-amber-400 animate-pulse",
  pending: "bg-amber-400 animate-pulse",
  disconnected: "bg-destructive",
};

function formatPhone(raw: string | null) {
  if (!raw) return "—";
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
    const ddd = d.slice(2, 4);
    const rest = d.slice(4);
    return `+55 (${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
  }
  return `+${d}`;
}

export function WhatsappSettingsPanel() {
  const [instance, setInstance] = useState<WhatsappInstance | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState<
    "reconnect" | "disconnect" | "webhook" | null
  >(null);
  const [webhookOk, setWebhookOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const aliveRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await getMyWhatsappInstance();
      if (aliveRef.current) {
        setInstance(next);
        setMissing(false);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        if (aliveRef.current) {
          setInstance(null);
          setMissing(true);
        }
        return;
      }
      if (err instanceof ApiError && err.status === 401) return;
      if (aliveRef.current && err instanceof Error) setError(err.message);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    void refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => {
      aliveRef.current = false;
      clearInterval(t);
    };
  }, [refresh]);

  const reconnect = useCallback(async () => {
    setBusy("reconnect");
    setError(null);
    try {
      const next = await reconnectWhatsappInstance();
      if (aliveRef.current) {
        setInstance(next);
        setMissing(false);
      }
    } catch (err) {
      if (aliveRef.current) {
        setError(err instanceof Error ? err.message : "Falha ao reconectar.");
      }
    } finally {
      if (aliveRef.current) setBusy(null);
    }
  }, []);

  const refreshWebhook = useCallback(async () => {
    setBusy("webhook");
    setError(null);
    setWebhookOk(null);
    try {
      const res = await refreshWhatsappWebhook();
      if (aliveRef.current) {
        const events = Array.isArray(res?.events) ? res.events : [];
        setWebhookOk(
          events.length
            ? `Webhook atualizado: ${events.join(", ")}`
            : "Webhook atualizado.",
        );
      }
    } catch (err) {
      if (aliveRef.current) {
        setError(
          err instanceof Error ? err.message : "Falha ao atualizar webhook.",
        );
      }
    } finally {
      if (aliveRef.current) setBusy(null);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!confirm("Desconectar o WhatsApp? A IA para de responder.")) return;
    setBusy("disconnect");
    setError(null);
    try {
      await deleteMyWhatsappInstance();
      if (aliveRef.current) {
        setInstance(null);
        setMissing(true);
      }
    } catch (err) {
      if (aliveRef.current) {
        setError(err instanceof Error ? err.message : "Falha ao desconectar.");
      }
    } finally {
      if (aliveRef.current) setBusy(null);
    }
  }, []);

  const status = instance?.status;
  const connected = status === "connected";
  const qr = instance?.qrCode ?? null;
  const qrSrc = qr
    ? qr.startsWith("data:")
      ? qr
      : `data:image/png;base64,${qr}`
    : null;

  return (
    <section className="rounded-lg border border-line bg-card p-[22px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">WhatsApp</div>
          <p className="text-xs text-ink-3">
            Status da conexão da assistente com o WhatsApp do negócio.
          </p>
        </div>
        {status ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2 py-1 mono text-[10px] uppercase tracking-[0.05em]">
            <span
              className={cn("size-1.5 rounded-full", STATUS_DOT[status])}
              aria-hidden
            />
            {STATUS_LABEL[status]}
          </span>
        ) : null}
      </div>

      <Separator className="my-4" />

      {missing ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-ink-3">
            Nenhum WhatsApp conectado nessa conta. Faça o onboarding pra criar
            uma instância.
          </div>
          <Button asChild size="sm">
            <a href="/onboarding">Ir pro onboarding</a>
          </Button>
        </div>
      ) : !instance ? (
        <div className="text-xs text-ink-3">Carregando…</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[auto_1fr]">
          {qrSrc && !connected ? (
            <div className="grid place-items-center rounded-lg border border-line bg-background p-3">
              <img src={qrSrc} alt="QR WhatsApp" className="size-44" />
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <Row
              label="Telefone"
              value={connected ? formatPhone(instance.phoneNumber) : "—"}
            />
            <Row label="Instance" value={instance.instanceName} mono />
            <Row label="Status" value={STATUS_LABEL[instance.status]} />
            {instance.pairingCode ? (
              <Row label="Pairing code" value={instance.pairingCode} mono />
            ) : null}

            {error ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
                {error}
              </p>
            ) : null}
            {webhookOk ? (
              <p className="rounded-md border border-accent-line bg-accent-soft px-2.5 py-1.5 text-xs">
                {webhookOk}
              </p>
            ) : null}

            <div className="mt-1 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={reconnect}
                disabled={busy !== null}
              >
                <RefreshCcw
                  className={cn(
                    "size-3.5",
                    busy === "reconnect" && "animate-spin",
                  )}
                />
                {busy === "reconnect"
                  ? "Reconectando…"
                  : connected
                    ? "Gerar QR novo"
                    : "Reconectar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshWebhook}
                disabled={busy !== null}
              >
                <Webhook
                  className={cn(
                    "size-3.5",
                    busy === "webhook" && "animate-pulse",
                  )}
                />
                {busy === "webhook" ? "Atualizando…" : "Atualizar webhook"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={disconnect}
                disabled={busy !== null}
              >
                <Power className="size-3.5" />
                {busy === "disconnect" ? "Desconectando…" : "Desconectar"}
              </Button>
            </div>
            {!connected && !qrSrc ? (
              <p className="text-xs text-ink-3">
                Sem QR ativo no momento. Clica em "Reconectar" pra gerar um novo.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="shrink-0 text-ink-3">{label}</span>
      <span className={cn("truncate font-medium", mono && "mono")}>{value}</span>
    </div>
  );
}
