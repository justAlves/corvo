import { Sparkles } from "lucide-react";

import { Chip } from "@/components/ui/chip";
import type { AssistantSummary } from "@/lib/dashboard";

export function AssistantProfileCard({ assistant }: { assistant: AssistantSummary }) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-lg border border-line bg-card p-7 text-center">
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
          Assistente de {assistant.business}
        </div>
      </div>
      <Chip variant="accent">
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
        {assistant.activeFor}
      </Chip>
      <dl className="mt-2.5 flex gap-6 text-xs text-ink-3">
        <Stat label="conversas" value={assistant.conversations.toString()} />
        <Stat label="automação" value={`${assistant.automation}%`} />
        <Stat label="médio" value={`${assistant.avgSeconds}s`} />
      </dl>
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
