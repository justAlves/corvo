"use client";

import { useState } from "react";

import { type AssistantFullData, saveAssistant } from "@/lib/assistant";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface WelcomeMessageCardProps {
  assistantFull: AssistantFullData;
}

export function WelcomeMessageCard({ assistantFull }: WelcomeMessageCardProps) {
  const [value, setValue] = useState(assistantFull.greeting);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = value !== assistantFull.greeting;

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      await saveAssistant({ ...assistantFull, greeting: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-line bg-card p-[22px]">
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
          onClick={() => setValue(assistantFull.greeting)}
        >
          Cancelar
        </Button>
        <Button size="sm" disabled={(!dirty && !saved) || busy} onClick={save}>
          {saved ? "Salvo!" : "Salvar"}
        </Button>
      </div>
    </section>
  );
}
