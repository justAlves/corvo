import { CalendarDays, Clock, Inbox, Sparkles } from "lucide-react";

import type { Metric } from "@/lib/dashboard";

const ICONS = {
  inbox: Inbox,
  spark: Sparkles,
  clock: Clock,
  calendar: CalendarDays,
} as const;

export function MetricCard({ metric }: { metric: Metric }) {
  const Icon = ICONS[metric.icon];
  return (
    <div className="rounded-lg border border-line bg-card p-[18px]">
      <div className="flex items-center justify-between">
        <div className="mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
          {metric.label}
        </div>
        <div className="grid size-[26px] place-items-center rounded-md bg-surface-2 text-ink-2">
          <Icon className="size-[13px]" />
        </div>
      </div>
      <div className="mt-3.5 flex items-baseline gap-2.5">
        <span className="text-[32px] font-bold tracking-[-0.03em]">
          {metric.value}
        </span>
        <span className="mono rounded-sm bg-accent-soft px-1.5 py-px text-xs text-accent-foreground">
          {metric.delta}
        </span>
      </div>
    </div>
  );
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.key} metric={m} />
      ))}
    </div>
  );
}
