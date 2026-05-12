import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ConversationStatusChip } from "@/components/dashboard/conversation-status-chip";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/lib/dashboard";

export function RecentConversations({ items }: { items: Conversation[] }) {
  return (
    <section className="mt-3.5 rounded-lg border border-line bg-card p-[22px]">
      <header className="mb-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold">Conversas recentes</h2>
          <p className="mt-0.5 text-xs text-ink-3">Precisando de você</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/inbox">
            Ver tudo <ArrowRight className="size-3" />
          </Link>
        </Button>
      </header>

      <ul className="flex flex-col">
        {items.map((conv, i) => (
          <li key={conv.id}>
            <Link
              href={`/dashboard/inbox/${conv.id}`}
              className={`grid grid-cols-[28px_180px_1fr_auto_70px] items-center gap-3 px-0.5 py-2.5 transition-colors hover:bg-surface-2/50 ${
                i === 0 ? "" : "border-t border-line"
              }`}
            >
              <span
                className="size-7 rounded-full"
                style={{ background: conv.color }}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">
                  {conv.name}
                </span>
                <span className="block truncate text-[11px] text-ink-3">
                  {conv.phone}
                </span>
              </span>
              <span className="truncate text-[13px] text-ink-2">
                {conv.preview}
              </span>
              <ConversationStatusChip status={conv.status} />
              <span className="mono text-right text-[11px] text-ink-3">
                {conv.time}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
