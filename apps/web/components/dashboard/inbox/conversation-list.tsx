"use client";

import Link from "next/link";

import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import {
  type InboxConversation,
  colorForJid,
  contactDisplayName,
  relativeTime,
} from "@/lib/inbox";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { InboxStatusChip } from "./inbox-status-chip";

interface ConversationListProps {
  items: InboxConversation[];
  selectedId: string | undefined;
  loading: boolean;
  error: string | null;
}

export function ConversationList({
  items,
  selectedId,
  loading,
  error,
}: ConversationListProps) {
  const newCount = items.filter((c) => c.status === "ai").length;

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-line bg-background">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3.5">
        <h2 className="flex-1 text-[17px] font-bold tracking-[-0.02em]">
          Caixa de entrada
        </h2>
        <Chip variant="accent">{newCount} ativas</Chip>
      </header>

      <div className="px-3.5 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
          <Input placeholder="Buscar conversas…" className="h-9 pl-8" />
        </div>
      </div>

      {error ? (
        <div className="px-4 py-3 text-xs text-destructive">{error}</div>
      ) : null}

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <li className="px-4 py-3 text-xs text-ink-3">Carregando…</li>
        ) : items.length === 0 ? (
          <li className="px-4 py-6 text-xs text-ink-3">
            Sem conversas. Quando alguém te mandar mensagem no WhatsApp, ela aparece aqui.
          </li>
        ) : (
          items.map((c) => {
            const active = c.id === selectedId;
            const name = contactDisplayName(c);
            return (
              <li key={c.id}>
                <Link
                  href={`/dashboard/inbox/${c.id}`}
                  className={cn(
                    "flex w-full items-center gap-2.5 border-l-2 px-4 py-3 text-left transition-colors",
                    active
                      ? "border-foreground bg-surface"
                      : "border-transparent hover:bg-surface/60",
                  )}
                >
                  <span
                    className="size-[34px] shrink-0 rounded-full"
                    style={{ background: colorForJid(c.contactJid) }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">
                        {name}
                      </span>
                      <span className="mono shrink-0 text-[10px] text-ink-3">
                        {relativeTime(c.lastMessageAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-3">
                      {c.preview || "—"}
                    </span>
                    <span className="mt-1 block">
                      <InboxStatusChip status={c.status} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
