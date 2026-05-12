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
} from "@/lib/whatsapp";

const POLL_MS = 6000;

function qrSrcOf(qr: string | null) {
  if (!qr) return null;
  return qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`;
}

export function ConnectionBanner() {
  const [instance, setInstance] = useState<WhatsappInstance | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const aliveRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await getMyWhatsappInstance();
      if (aliveRef.current) setInstance(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        if (aliveRef.current) setInstance(null);
        return;
      }
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
      if (next.status !== "connected" && next.qrCode) setQrOpen(true);
    } catch (err) {
      if (aliveRef.current) {
        setError(err instanceof Error ? err.message : "Falha ao reconectar.");
      }
    } finally {
      if (aliveRef.current) setReconnecting(false);
    }
  }, []);

  if (!instance || instance.status === "connected") return null;

  const qrSrc = qrSrcOf(instance.qrCode);
  const label =
    instance.status === "disconnected"
      ? "WhatsApp desconectado"
      : instance.status === "connecting"
        ? "WhatsApp conectando…"
        : "WhatsApp pendente";

  const sublabel = error
    ? error
    : qrSrc
      ? "Escaneia o QR pra retomar."
      : "Gera um QR novo pra reconectar.";

  return (
    <>
      <div className="flex items-start gap-3 border-b border-line bg-amber-50/40 px-4 py-2.5 text-xs dark:bg-amber-500/5">
        <div className="flex-1">
          <div className="font-semibold">{label}</div>
          <div className="text-ink-3">{sublabel}</div>
        </div>
        {qrSrc ? (
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line bg-background px-2 py-1 mono text-[10px] uppercase tracking-[0.05em] hover:bg-surface"
          >
            <QrCode className="size-3" />
            Ver QR
          </button>
        ) : null}
        <button
          type="button"
          onClick={reconnect}
          disabled={reconnecting}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line-strong bg-background px-2.5 py-1.5 mono text-[10px] uppercase tracking-[0.05em] transition-colors hover:bg-surface disabled:opacity-60"
        >
          <RefreshCcw className={cn("size-3", reconnecting && "animate-spin")} />
          {reconnecting ? "Reconectando" : "Reconectar"}
        </button>
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
          {instance.pairingCode ? (
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
