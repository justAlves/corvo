import { cn } from "@/lib/utils";

export function AuthCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-[22px] pb-0 pt-[18px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-[22px] pb-6 pt-[18px]", className)}>{children}</div>
  );
}

export function AuthCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-t border-border bg-surface px-[22px] py-3.5 text-center text-[13px] text-ink-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex gap-1" aria-label={`Passo ${current + 1} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "h-1 w-4 rounded-full transition-colors",
            i <= current ? "bg-foreground" : "bg-surface-2",
          )}
        />
      ))}
    </div>
  );
}
