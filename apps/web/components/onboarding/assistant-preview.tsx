"use client";

import { ChatBubble } from "@/components/onboarding/chat-bubble";
import {
  ASSISTANT_AVATARS,
  type AssistantAvatar,
} from "@/lib/onboarding-config";
import type { OnboardingState } from "@/components/onboarding/types";

interface AssistantPreviewProps {
  state: OnboardingState;
}

export function AssistantPreview({ state }: AssistantPreviewProps) {
  const avatar: AssistantAvatar =
    ASSISTANT_AVATARS[state.assistant.avatar] ?? ASSISTANT_AVATARS[0]!;

  const hoursLine =
    state.biz.hoursFrom && state.biz.hoursTo
      ? `Sim! Hoje a gente abre das ${state.biz.hoursFrom} às ${state.biz.hoursTo}. 💚`
      : "Sim, estou aqui pra ajudar!";

  return (
    <aside className="sticky top-24 h-fit">
      <p className="mono mb-2.5 text-[11px] uppercase tracking-[0.08em] text-ink-3">
        Preview
      </p>
      <div className="overflow-hidden rounded-2xl border border-line bg-background">
        <div className="flex flex-col items-center gap-3 border-b border-line bg-surface px-6 py-6">
          <div
            className="grid h-[72px] w-[72px] place-items-center rounded-full text-[30px] text-[oklch(0.2_0.01_250)] animate-pop-in"
            key={state.assistant.avatar}
            style={{ background: avatar.bg }}
          >
            {avatar.face}
          </div>
          <div className="text-center">
            <p className="font-serif text-[20px] font-bold tracking-[-0.02em]">
              {state.assistant.name || "Lia"}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Assistente de {state.biz.name || "seu negócio"}
            </p>
          </div>
          <span className="mono inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-accent-soft px-2.5 py-1 text-[11px] uppercase tracking-[0.04em] text-accent-foreground dark:text-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Online agora
          </span>
        </div>
        <div className="flex min-h-[220px] flex-col gap-2 p-4">
          <ChatBubble from="ai">
            {state.assistant.greeting || "Oi!"}
          </ChatBubble>
          <ChatBubble from="them">Oi, vocês abrem hoje?</ChatBubble>
          <ChatBubble from="ai">{hoursLine}</ChatBubble>
        </div>
      </div>
    </aside>
  );
}
