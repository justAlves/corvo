import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StatusPillProps {
  icon: ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}

export function StatusPill({ icon, label, value, ok = false }: StatusPillProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5">
      <div
        className={cn(
          "grid h-7 w-7 place-items-center rounded-md",
          ok
            ? "bg-accent-soft text-accent-foreground"
            : "bg-surface-2 text-ink-3",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
          {label}
        </div>
        <div className="flex items-center gap-1.5 text-[13px] font-semibold">
          {value}
          {ok && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        </div>
      </div>
    </div>
  );
}
