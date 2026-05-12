import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  from: "ai" | "them";
  children: ReactNode;
  animate?: boolean;
}

export function ChatBubble({ from, children, animate = true }: ChatBubbleProps) {
  const isThem = from === "them";
  return (
    <p
      className={cn(
        "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug",
        animate && (isThem ? "animate-slide-in-left" : "animate-slide-in-right"),
        isThem
          ? "self-start rounded-bl-sm border border-line bg-surface text-foreground"
          : "self-end rounded-br-sm bg-accent-soft text-accent-foreground dark:text-foreground",
      )}
    >
      {children}
    </p>
  );
}
