"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface WelcomeMessageCardProps {
  initialValue: string;
  onSave?: (value: string) => Promise<void> | void;
}

export function WelcomeMessageCard({ initialValue, onSave }: WelcomeMessageCardProps) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const dirty = value !== initialValue;

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      await onSave?.(value);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-line bg-card p-[22px] lg:col-span-2">
      <div className="text-sm font-semibold">Mensagem de boas-vindas</div>
      <p className="mt-0.5 mb-2.5 text-xs text-ink-3">
        Primeiro contato com quem nunca te mandou mensagem
      </p>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="resize-y"
      />
      <div className="mt-2.5 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!dirty || busy}
          onClick={() => setValue(initialValue)}
        >
          Cancelar
        </Button>
        <Button size="sm" disabled={!dirty || busy} onClick={save}>
          Salvar
        </Button>
      </div>
    </section>
  );
}
