import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-accent-line bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-foreground dark:text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
