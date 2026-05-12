"use client";

import { QrCode, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  getMyWhatsappInstance,
  reconnectWhatsappInstance,
  type WhatsappInstance,
  type WhatsappStatus,
} from "@/lib/whatsapp";

const POLL_MS = 4000;

const DOT: Record<WhatsappStatus, string> = {
  connected: "bg-accent",
  connecting: "bg-amber-400 animate-pulse",
  pending: "bg-amber-400 animate-pulse",
  disconnected: "bg-destructive",
};

const LABEL: Record<WhatsappStatus, string> = {
  connected: "WhatsApp ativo",
  connecting: "Conectando…",
  pending: "Aguardando QR",
  disconnected: "Desconectado",
};

function formatPhone(raw: string | null) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
    const ddd = d.slice(2, 4);
    const rest = d.slice(4);
    return `+55 (${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
  }
  return `+${d}`;
}

function qrSrcOf(qr: string | null) {
  if (!qr) return null;
  return qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`;
}

export function WhatsappStatusCard() {
  const [instance, setInstance] = useState<WhatsappInstance | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
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

  useEffect(() => {
    if (instance?.status === "connected" && qrOpen) setQrOpen(false);
  }, [instance?.status, qrOpen]);

  const reconnect = useCallback(async () => {
    setReconnecting(true);
    setError(null);
    try {
      const next = await reconnectWhatsappInstance();
      if (!aliveRef.current) return;
      setInstance(next);
      setMissing(false);
      if (next.status !== "connected" && next.qrCode) setQrOpen(true);
    } catch (err) {
      if (aliveRef.current) {
        setError(err instanceof Error ? err.message : "Falha ao reconectar.");
      }
    } finally {
      if (aliveRef.current) setReconnecting(false);
    }
  }, []);

  const status = instance?.status;
  const connected = status === "connected";
  const phone = instance ? formatPhone(instance.phoneNumber) : null;
  const qrSrc = qrSrcOf(instance?.qrCode ?? null);

  let body: React.ReactNode;
  if (missing) {
    body = (
      <>
        <Header status="disconnected" labelOverride="WhatsApp não conectado" />
        <a
          href="/onboarding"
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-line-strong bg-background px-2 py-1.5 text-[11px] font-medium transition-colors hover:bg-surface-2"
        >
          Conectar
        </a>
      </>
    );
  } else if (!instance || !status) {
    body = (
      <div className="text-[11px] text-ink-3">Carregando status…</div>
    );
  } else {
    body = (
      <>
        <Header status={status} />
        <div className="text-xs leading-snug text-ink-2">
          {connected
            ? phone
              ? `Respondendo em ${phone}`
              : "Pronta pra receber mensagens"
            : error ?? "Escaneia um QR pra reconectar."}
        </div>
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            onClick={reconnect}
            disabled={reconnecting}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line-strong bg-background px-2 py-1.5 text-[11px] font-medium transition-colors hover:bg-surface-2 disabled:opacity-60"
          >
            <RefreshCcw
              className={cn("size-3", reconnecting && "animate-spin")}
            />
            {reconnecting
              ? "Reconectando…"
              : connected
                ? "Novo QR"
                : "Reconectar"}
          </button>
          {!connected && qrSrc ? (
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-line-strong bg-background px-2 py-1.5 text-[11px] font-medium transition-colors hover:bg-surface-2"
            >
              <QrCode className="size-3" />
              QR
            </button>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mt-auto rounded-lg border border-line bg-surface p-3">
        {body}
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Escaneia o QR</DialogTitle>
            <DialogDescription>
              Abre o WhatsApp → Aparelhos conectados → Conectar um aparelho.
            </DialogDescription>
          </DialogHeader>
          {qrSrc ? (
            <div className="grid place-items-center rounded-lg border border-line bg-background p-4">
              <img src={qrSrc} alt="QR WhatsApp" className="size-64" />
            </div>
          ) : (
            <div className="grid h-64 place-items-center text-xs text-ink-3">
              Aguardando QR…
            </div>
          )}
          {instance?.pairingCode ? (
            <div className="text-center text-xs text-ink-3">
              Pairing code:{" "}
              <span className="mono font-medium text-foreground">
                {instance.pairingCode}
              </span>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Header({
  status,
  labelOverride,
}: {
  status: WhatsappStatus;
  labelOverride?: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className={cn("size-1.5 rounded-full", DOT[status])} aria-hidden />
      <span className="mono text-[10px] uppercase tracking-[0.08em] text-ink-2">
        {labelOverride ?? LABEL[status]}
      </span>
    </div>
  );
}
