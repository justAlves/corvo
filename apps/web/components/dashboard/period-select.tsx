"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type Period = "today" | "yesterday" | "7d" | "30d";

const LABELS: Record<Period, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  "7d": "7 dias",
  "30d": "30 dias",
};

export function PeriodSelect({ current }: { current: Period }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(p: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", p);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex rounded-md border border-line overflow-hidden">
      {(Object.keys(LABELS) as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => select(p)}
          className={`px-3 h-8 text-[13px] border-r border-line last:border-r-0 transition-colors ${
            current === p
              ? "bg-foreground text-background font-semibold"
              : "bg-background text-ink-2 hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          {LABELS[p]}
        </button>
      ))}
    </div>
  );
}
