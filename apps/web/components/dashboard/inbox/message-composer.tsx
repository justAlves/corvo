"use client";

import { Paperclip, Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageComposerProps {
  conversationId: string;
  onSend?: (conversationId: string, text: string) => Promise<void> | void;
}

export function MessageComposer({ conversationId, onSend }: MessageComposerProps) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const text = value.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await onSend?.(conversationId, text);
      setValue("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="flex items-center gap-2 border-t border-line bg-background p-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0">
        <Paperclip className="size-3.5" />
        <span className="sr-only">Anexar</span>
      </Button>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escrever como atendente humano…"
        className="h-10"
        disabled={busy}
      />
      <Button type="submit" size="sm" disabled={busy || !value.trim()}>
        <Send className="size-3.5" />
        <span className="sr-only">Enviar</span>
      </Button>
    </form>
  );
}
