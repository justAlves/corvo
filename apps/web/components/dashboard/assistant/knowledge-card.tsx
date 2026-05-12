import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { KnowledgeRow } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export function KnowledgeCard({ rows }: { rows: KnowledgeRow[] }) {
  return (
    <div className="rounded-lg border border-line bg-card p-[22px]">
      <div className="text-sm font-semibold">Base de conhecimento</div>
      <p className="mt-0.5 mb-3.5 text-xs text-ink-3">
        O que a IA sabe sobre o teu negócio
      </p>
      <ul>
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center gap-2.5 border-t border-line py-2.5 first:border-t-0"
          >
            <span
              className={cn(
                "grid size-[22px] place-items-center rounded-full",
                row.ok
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-2 text-ink-3",
              )}
              aria-hidden
            >
              {row.ok ? (
                <Check className="size-3" strokeWidth={2.5} />
              ) : (
                <Plus className="size-3" />
              )}
            </span>
            <div className="flex-1">
              <div className="text-[13px] font-medium">{row.name}</div>
              <div className="text-[11px] text-ink-3">{row.meta}</div>
            </div>
            <Button variant="ghost" size="sm">
              {row.ok ? "Editar" : "Conectar"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
