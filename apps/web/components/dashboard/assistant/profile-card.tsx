import { Sparkles } from "lucide-react";

import { Chip } from "@/components/ui/chip";
import type { AssistantSummary } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

function activeFor(publishedAt: string | null): string {
  if (!publishedAt) return "Não publicada";
  const days = Math.floor(
    (Date.now() - new Date(publishedAt).getTime()) / 86_400_000,
  );
  if (days === 0) return "Ativa hoje";
  if (days === 1) return "Ativa há 1 dia";
  return `Ativa há ${days} dias`;
}

export function AssistantProfileCard({
  assistant,
  className,
  children,
}: {
  assistant: AssistantSummary;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col rounded-lg border border-line bg-card", className)}>
      <div className="flex flex-col items-center gap-3.5 p-7 text-center">
        <div
          className="grid size-[88px] place-items-center rounded-full text-[36px]"
          style={{
            background: "oklch(0.78 0.19 145)",
            color: "oklch(0.22 0.08 145)",
          }}
        >
          <Sparkles className="size-9" />
        </div>
        <div>
          <div className="text-[22px] font-bold tracking-[-0.02em]">
            {assistant.name}
          </div>
          <div className="mt-0.5 text-[13px] text-ink-2">
            Assistente de {assistant.businessName}
          </div>
        </div>
        <Chip variant={assistant.publishedAt ? "accent" : "default"}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          {activeFor(assistant.publishedAt)}
        </Chip>
        <dl className="mt-2.5 flex gap-6 text-xs text-ink-3">
          <Stat label="conversas" value={String(assistant.totalConversations)} />
          <Stat label="automação" value={`${assistant.automationPct}%`} />
        </dl>
      </div>
      {children && (
        <div className="border-t border-line">{children}</div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-lg font-bold text-ink">{value}</span>
      <span className="mono">{label}</span>
    </div>
  );
}
