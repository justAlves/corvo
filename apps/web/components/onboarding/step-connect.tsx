"use client";

import { Check, RefreshCcw, Shield, Webhook, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { QrDisplay } from "@/components/onboarding/qr-display";
import { StatusPill } from "@/components/onboarding/status-pill";
import { StepTitle } from "@/components/onboarding/step-title";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  createWhatsappInstance,
  getMyWhatsappInstance,
  reconnectWhatsappInstance,
  type WhatsappInstance,
  type WhatsappStatus,
} from "@/lib/whatsapp";

interface StepConnectProps {
  connected: boolean;
  onConnected: () => void;
}

const POLL_MS = 2500;

export function StepConnect({ connected, onConnected }: StepConnectProps) {
  const [instance, setInstance] = useState<WhatsappInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onConnectedRef = useRef(onConnected);

  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyInstance = useCallback((next: WhatsappInstance) => {
    setInstance(next);
    if (next.status === "connected") {
      onConnectedRef.current();
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const next = await getMyWhatsappInstance();
        applyInstance(next);
        if (next.status === "connected") stopPolling();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          stopPolling();
          setInstance(null);
        }
      }
    }, POLL_MS);
  }, [applyInstance, stopPolling]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let current: WhatsappInstance;
      try {
        current = await getMyWhatsappInstance();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          current = await createWhatsappInstance();
        } else {
          throw err;
        }
      }
      applyInstance(current);
      if (current.status !== "connected") startPolling();
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Faz login pra conectar teu WhatsApp."
          : err instanceof Error
            ? err.message
            : "Não rolou conectar agora.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [applyInstance, startPolling]);

  const reconnect = useCallback(async () => {
    setReconnecting(true);
    setError(null);
    try {
      const next = await reconnectWhatsappInstance();
      applyInstance(next);
      if (next.status !== "connected") startPolling();
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Faz login pra reconectar."
          : err instanceof Error
            ? err.message
            : "Não rolou reconectar agora.";
      setError(message);
    } finally {
      setReconnecting(false);
    }
  }, [applyInstance, startPolling]);

  useEffect(() => {
    bootstrap();
    return () => stopPolling();
  }, [bootstrap, stopPolling]);

  const status: WhatsappStatus = instance?.status ?? "pending";
  const qrSrc = instance?.qrCode ?? null;

  const statusCopy =
    status === "connected"
      ? "conectado"
      : status === "connecting"
        ? "aguardando celular…"
        : qrSrc
          ? "pronto pra escanear"
          : loading
            ? "gerando QR…"
            : error
              ? "falhou"
              : "preparando…";

  // indeterminate progress while connecting, 100 when done
  const progress = connected || status === "connected" ? 100 : qrSrc ? 40 : 10;

  return (
    <div>
      <StepTitle
        k="01"
        title="Conecta teu WhatsApp"
        sub="Escaneia o QR code com o celular — a gente faz o resto via Evolution API. Não precisa trocar de número."
      />

      <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-background md:grid-cols-[auto_1fr] animate-fade-up">
        <div className="grid place-items-center border-b border-line p-8 md:border-b-0 md:border-r">
          <QrDisplay
            progress={progress}
            done={status === "connected"}
            src={qrSrc}
            loading={loading}
          />
        </div>

        <div className="flex flex-col gap-4 p-8">
          <div>
            <p className="mono mb-1.5 text-[11px] uppercase tracking-[0.08em] text-ink-3">
              Como escanear
            </p>
            <ol className="m-0 list-decimal space-y-1 pl-5 text-[14px] leading-[1.7] text-muted-foreground">
              <li>Abre o WhatsApp no teu celular</li>
              <li>
                Configurações → <b className="text-foreground">Aparelhos conectados</b>
              </li>
              <li>
                Toca em <b className="text-foreground">Conectar um aparelho</b>
              </li>
              <li>Aponta a câmera pra esse QR code</li>
            </ol>
          </div>

          {status === "connected" ? (
            <div className="flex animate-fade-up items-center gap-3 rounded-xl border border-accent-line bg-accent-soft p-3.5 text-accent-foreground dark:text-foreground">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <div>
                <p className="text-[14px] font-semibold">Conectado!</p>
                <p className="text-[12px] text-muted-foreground">
                  {instance?.phoneNumber
                    ? formatPhone(instance.phoneNumber)
                    : "pronto pra receber"}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex animate-fade-up items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5">
              <div>
                <p className="text-[13px] font-semibold">Algo deu ruim</p>
                <p className="text-[12px] text-muted-foreground">{error}</p>
              </div>
              <button
                type="button"
                onClick={reconnect}
                disabled={reconnecting}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-surface-2 disabled:opacity-60"
              >
                <RefreshCcw className={cn("size-3.5", reconnecting && "animate-spin")} />
                {reconnecting ? "Reconectando…" : "Tentar de novo"}
              </button>
            </div>
          ) : status === "disconnected" ? (
            <div className="flex animate-fade-up items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5">
              <div>
                <p className="text-[13px] font-semibold">Conexão caiu</p>
                <p className="text-[12px] text-muted-foreground">
                  Gera um QR novo pra reconectar o WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={reconnect}
                disabled={reconnecting}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-surface-2 disabled:opacity-60"
              >
                <RefreshCcw className={cn("size-3.5", reconnecting && "animate-spin")} />
                {reconnecting ? "Reconectando…" : "Reconectar"}
              </button>
            </div>
          ) : (
            <div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-300 ease-out",
                  )}
                  style={{ width: `${progress}%` }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 animate-shimmer rounded-full opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="mono text-[11px] text-ink-3">
                  {statusCopy}
                </span>
                <button
                  type="button"
                  onClick={reconnect}
                  disabled={reconnecting}
                  className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 mono text-[10px] uppercase tracking-[0.05em] text-ink-3 transition-colors hover:bg-surface disabled:opacity-60"
                >
                  <RefreshCcw
                    className={cn("size-3", reconnecting && "animate-spin")}
                  />
                  {reconnecting ? "atualizando" : "novo QR"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-1 rounded-lg border border-line bg-surface p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <Shield className="size-3.5 text-accent-foreground dark:text-foreground" />
              <span className="text-[12px] font-semibold">Seguro e privado</span>
            </div>
            <p className="text-[12px] leading-[1.5] text-muted-foreground">
              A conexão usa a Evolution API — seus dados ficam no seu servidor. Nenhuma mensagem passa pelo nosso backend sem criptografia.
            </p>
          </div>
        </div>
      </div>

      {status === "connected" && (
        <div
          className="mt-4 grid animate-fade-up grid-cols-1 gap-3 rounded-xl border border-line bg-background p-4 sm:grid-cols-3"
          style={{ animationDelay: "80ms" }}
        >
          <StatusPill
            icon={<Check className="size-3.5" strokeWidth={2.5} />}
            label="WhatsApp"
            value="Conectado"
            ok
          />
          <StatusPill
            icon={<Shield className="size-3.5" />}
            label="Evolution API"
            value="v2.2.3"
            ok
          />
          <StatusPill
            icon={<Webhook className="size-3.5" />}
            label="Webhook"
            value="Ativo"
            ok
          />
        </div>
      )}

      {status !== "connected" && !error && qrSrc && (
        <p className="mono mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.08em] text-ink-3">
          <Zap className="size-3" />
          Conexão instantânea · sem troca de número
        </p>
      )}
    </div>
  );
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    const mid = rest.slice(0, rest.length - 4);
    const end = rest.slice(-4);
    return `+55 (${ddd}) ${mid}-${end}`;
  }
  if (digits.length >= 12) {
    const cc = digits.slice(0, digits.length - 10);
    const ddd = digits.slice(-10, -8);
    const mid = digits.slice(-8, -4);
    const end = digits.slice(-4);
    return `+${cc} (${ddd}) ${mid}-${end}`;
  }
  return raw;
}
