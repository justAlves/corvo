"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { KnowledgeRow } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { CatalogDialog } from "./catalog-dialog";
import { FaqDialog } from "./faq-dialog";

const CATALOG_TITLE = "Cardápio / Catálogo";
const FAQ_TITLE = "FAQ — Perguntas frequentes";

export function KnowledgeCard({ rows }: { rows: KnowledgeRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="p-[22px]">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">Base de conhecimento</div>
          <p className="mt-0.5 text-xs text-ink-3">
            O que a IA sabe sobre o teu negócio
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <CatalogDialog onSuccess={refresh} />
          <FaqDialog onSuccess={refresh} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-center text-xs text-ink-3">
          Nenhuma informação ainda. Adicione um cardápio ou FAQ.
        </p>
      ) : (
        <ul className="mt-3.5">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-2.5 border-t border-line py-2.5 first:border-t-0"
            >
              <span
                className={cn(
                  "grid size-[22px] shrink-0 place-items-center rounded-full",
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
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{row.name}</div>
                <div className="text-[11px] text-ink-3">{row.meta}</div>
              </div>
              <RowAction row={row} onSuccess={refresh} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RowAction({ row, onSuccess }: { row: KnowledgeRow; onSuccess: () => void }) {
  if (row.kind !== "text") {
    return (
      <Button variant="ghost" size="sm" disabled>
        {row.ok ? "Editar" : "Conectar"}
      </Button>
    );
  }

  const editTrigger = (
    <Button variant="ghost" size="sm">
      Editar
    </Button>
  );

  if (row.name === CATALOG_TITLE) {
    return <CatalogDialog editId={row.id} onSuccess={onSuccess} trigger={editTrigger} />;
  }
  if (row.name === FAQ_TITLE) {
    return <FaqDialog editId={row.id} onSuccess={onSuccess} trigger={editTrigger} />;
  }

  return (
    <Button variant="ghost" size="sm" disabled>
      Editar
    </Button>
  );
}
