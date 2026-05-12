import { type InboxConversationStatus, statusLabel } from "@/lib/inbox";
import { cn } from "@/lib/utils";

const STYLES: Record<InboxConversationStatus, string> = {
  ai: "bg-accent-soft text-accent-foreground border-accent-line dark:text-foreground",
  human: "bg-surface-2 text-ink-2 border-line",
  waiting: "bg-surface text-ink-2 border-line",
  closed: "bg-surface text-ink-3 border-line",
};

export function InboxStatusChip({
  status,
  className,
}: {
  status: InboxConversationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mono inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.04em]",
        STYLES[status],
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
