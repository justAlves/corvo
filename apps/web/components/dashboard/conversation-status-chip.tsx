import { cn } from "@/lib/utils";
import type { ConversationStatus } from "@/lib/dashboard";

const STYLES: Record<ConversationStatus, string> = {
  IA: "bg-accent-soft text-accent-foreground border-accent-line dark:text-foreground",
  Humano: "bg-surface-2 text-ink-2 border-line",
  Aguardando: "bg-surface text-ink-2 border-line",
};

export function ConversationStatusChip({
  status,
  className,
}: {
  status: ConversationStatus;
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
      {status}
    </span>
  );
}
