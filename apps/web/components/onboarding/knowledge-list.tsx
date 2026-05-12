"use client";

import { FileText, Globe, Trash2 } from "lucide-react";

import type { KnowledgeItem } from "@/lib/knowledge";
import { cn } from "@/lib/utils";

interface KnowledgeListProps {
  items: KnowledgeItem[];
  onRemove: (id: string) => void;
  removing?: string | null;
}

export function KnowledgeList({ items, onRemove, removing }: KnowledgeListProps) {
  if (!items.length) return null;
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      <p className="mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
        Base do negócio
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-line bg-background px-3 py-2"
          >
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-2 text-ink-3"
            >
              {item.kind === "url" ? (
                <Globe className="size-3.5" />
              ) : (
                <FileText className="size-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{item.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {item.sourceUrl ?? formatBytes(item.sizeBytes)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={removing === item.id}
              aria-label={`Remover ${item.title}`}
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-foreground",
                removing === item.id && "opacity-50",
              )}
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
