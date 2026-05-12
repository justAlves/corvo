import type { ReactNode } from "react";

import type { InboxMessageRole } from "@/lib/inbox";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  role: Exclude<InboxMessageRole, "system">;
  failed?: boolean;
  children: ReactNode;
}

export function ChatBubble({ role, failed, children }: ChatBubbleProps) {
  const mine = role === "assistant" || role === "agent";
  return (
    <div
      className={cn(
        "flex animate-fade-up",
        mine ? "justify-end" : "justify-start",
      )}
    >
      <div className="flex max-w-[80%] flex-col gap-0.5">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-snug whitespace-pre-wrap",
            mine
              ? "bg-foreground text-background rounded-br-sm"
              : "bg-card border border-line rounded-bl-sm",
            failed && "ring-1 ring-destructive/60",
          )}
        >
          {children}
        </div>
        {mine ? (
          <div className="self-end mono text-[10px] uppercase tracking-[0.05em] text-ink-3">
            {failed ? "falhou" : role === "agent" ? "atendente" : "ia"}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SystemMessage({ children }: { children: ReactNode }) {
  return (
    <div className="self-center rounded-full border border-line bg-background px-3 py-1 mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
      {children}
    </div>
  );
}
