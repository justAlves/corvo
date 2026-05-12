interface SummaryRowProps {
  label: string;
  value: string;
  ok?: boolean;
}

export function SummaryRow({ label, value, ok = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-right text-[13px] font-medium">
        {value}
        {ok && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
      </span>
    </div>
  );
}
