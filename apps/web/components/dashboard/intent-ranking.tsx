import type { IntentRow } from "@/lib/dashboard";

export function IntentRanking({ rows }: { rows: IntentRow[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span>{row.label}</span>
            <span className="mono text-ink-3">{row.pct}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
