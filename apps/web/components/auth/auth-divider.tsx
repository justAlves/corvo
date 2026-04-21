export function AuthDivider({ label = "ou" }: { label?: string }) {
  return (
    <div className="my-[18px] flex items-center gap-3 text-ink-3">
      <span className="h-px flex-1 bg-border" />
      <span className="mono px-1 text-[11px] uppercase tracking-[0.1em]">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
