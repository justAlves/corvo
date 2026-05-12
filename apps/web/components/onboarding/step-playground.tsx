"use client";

import { AlertCircle, ArrowRight, RefreshCcw, RefreshCw, Send, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { ChatBubble } from "@/components/onboarding/chat-bubble";
import { StepTitle } from "@/components/onboarding/step-title";
import { SummaryRow } from "@/components/onboarding/summary-row";
import { TypingIndicator } from "@/components/onboarding/typing-indicator";
import type { OnboardingState } from "@/components/onboarding/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import type { KnowledgeItem } from "@/lib/knowledge";
import {
  ASSISTANT_AVATARS,
  PLAYGROUND_SUGGESTIONS,
} from "@/lib/onboarding-config";
import {
  sendPlaygroundMessage,
  type PlaygroundMessage,
} from "@/lib/playground";

interface StepPlaygroundProps {
  state: OnboardingState;
  knowledge: KnowledgeItem[];
}

type Msg = { from: "ai" | "them"; text: string; id: number };

function historyFromMsgs(msgs: Msg[]): PlaygroundMessage[] {
  return msgs
    .map((m): PlaygroundMessage | null => {
      if (m.from === "ai" && m.id === 0) return null; // skip client-side greeting
      return {
        role: m.from === "ai" ? "assistant" : "user",
        content: m.text,
      };
    })
    .filter((x): x is PlaygroundMessage => x !== null);
}

export function StepPlayground({ state, knowledge }: StepPlaygroundProps) {
  const avatar =
    ASSISTANT_AVATARS[state.assistant.avatar] ?? ASSISTANT_AVATARS[0]!;

  const initialGreeting = useMemo(
    () => state.assistant.greeting || "Oi! Como posso te ajudar hoje?",
    [state.assistant.greeting],
  );

  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "ai", text: initialGreeting, id: 0 },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const msgsRef = useRef(msgs);

  useEffect(() => {
    msgsRef.current = msgs;
  }, [msgs]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [msgs, typing, error]);

  const callModel = useCallback(async (history: PlaygroundMessage[]) => {
    setTyping(true);
    setError(null);
    try {
      const reply = await sendPlaygroundMessage(history);
      setMsgs((prev) => [
        ...prev,
        {
          from: "ai",
          text: reply.reply || "(sem resposta)",
          id: idRef.current++,
        },
      ]);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao responder.";
      setError(msg);
    } finally {
      setTyping(false);
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;
      const userMsg: Msg = {
        from: "them",
        text: trimmed,
        id: idRef.current++,
      };
      const nextMsgs = [...msgsRef.current, userMsg];
      setMsgs(nextMsgs);
      setInput("");
      void callModel(historyFromMsgs(nextMsgs));
    },
    [callModel, typing],
  );

  const retry = useCallback(() => {
    if (typing) return;
    void callModel(historyFromMsgs(msgsRef.current));
  }, [callModel, typing]);

  const dismissError = useCallback(() => setError(null), []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send(input);
  };

  const reset = () => {
    setTyping(false);
    setError(null);
    setMsgs([{ from: "ai", text: initialGreeting, id: idRef.current++ }]);
  };

  return (
    <div>
      <StepTitle
        k="04"
        title="Testa antes de publicar"
        sub="Conversa com ela como se fosse um cliente. Ela já conhece o negócio e o que você importou."
      />

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <aside
          className="animate-fade-up"
          style={{ animationDelay: "30ms" }}
        >
          <p className="mono mb-2.5 text-[11px] uppercase tracking-[0.08em] text-ink-3">
            Resumo
          </p>
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-background p-4">
            <SummaryRow label="WhatsApp" value="Conectado via QR" ok />
            <SummaryRow
              label="Negócio"
              value={state.biz.name || "—"}
              ok={!!state.biz.name}
            />
            <SummaryRow
              label="Categoria"
              value={state.biz.category || "—"}
              ok={!!state.biz.category}
            />
            <SummaryRow
              label="Horário"
              value={`${state.biz.hoursFrom} – ${state.biz.hoursTo}`}
              ok
            />
            <SummaryRow
              label="Base"
              value={
                knowledge.length
                  ? `${knowledge.length} docs`
                  : "Sem documentos"
              }
              ok={knowledge.length > 0}
            />
            <span className="h-px w-full bg-line" />
            <SummaryRow label="Assistente" value={state.assistant.name} ok />
            <SummaryRow label="Tom" value={state.assistant.tone} ok />
          </div>

          <p className="mono mb-2.5 mt-5 text-[11px] uppercase tracking-[0.08em] text-ink-3">
            Tenta perguntar
          </p>
          <div className="flex flex-col gap-1.5">
            {PLAYGROUND_SUGGESTIONS.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => send(s)}
                disabled={typing}
                className="w-full justify-between"
              >
                <span className="truncate">{s}</span>
                <ArrowRight className="size-3 shrink-0" />
              </Button>
            ))}
          </div>
        </aside>

        <div
          className="flex h-[560px] animate-fade-up flex-col overflow-hidden rounded-2xl border border-line bg-background"
          style={{ animationDelay: "80ms" }}
        >
          <header className="flex items-center gap-2.5 border-b border-line bg-surface px-4 py-2.5">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full text-[15px]"
              style={{ background: avatar.bg }}
            >
              {avatar.face}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">
                {state.assistant.name || "Lia"}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Playground · não envia pra clientes reais
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={reset}
            >
              <RefreshCw className="size-3.5" />
              Reiniciar
            </Button>
          </header>

          <div
            ref={scrollerRef}
            className="flex flex-1 flex-col gap-2 overflow-y-auto p-4"
          >
            {msgs.map((m) => (
              <ChatBubble key={m.id} from={m.from}>
                {m.text}
              </ChatBubble>
            ))}
            {typing && <TypingIndicator />}
            {error && (
              <div className="mt-1 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-[13px] animate-fade-up">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    Não consegui responder
                  </p>
                  <p className="mt-0.5 break-words text-[12px] text-muted-foreground">
                    {error}
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retry}
                      disabled={typing}
                      className="gap-1.5"
                    >
                      <RefreshCcw className="size-3" />
                      Tentar de novo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={dismissError}
                      className="gap-1.5"
                    >
                      <X className="size-3" />
                      Dispensar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-line p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escreve como se fosse um cliente…"
              className="flex-1"
              disabled={typing}
            />
            <Button
              variant="accent"
              size="md"
              onClick={() => send(input)}
              disabled={typing || !input.trim()}
              aria-label="Enviar"
              className="w-11 px-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
