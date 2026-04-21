import { cn } from "@/lib/utils";

interface Strength {
  level: number;
  label: string;
  color: string;
}

function score(pw: string): Strength {
  if (!pw) return { level: 0, label: "", color: "var(--ink-3)" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
  const cfg: Omit<Strength, "level">[] = [
    { label: "fraquinha", color: "oklch(0.7 0.18 30)" },
    { label: "ok", color: "oklch(0.72 0.16 60)" },
    { label: "boa", color: "oklch(0.74 0.14 120)" },
    { label: "forte", color: "oklch(0.7667 0.1752 230.82)" },
  ];
  return { level: s, ...(cfg[Math.max(0, s - 1)] ?? cfg[0]) };
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const s = score(value);
  return (
    <div className="mt-1 flex items-center gap-2.5">
      <div className="flex flex-1 gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-full transition-colors",
              i >= s.level && "bg-surface-2",
            )}
            style={i < s.level ? { background: s.color } : undefined}
          />
        ))}
      </div>
      <span
        className="mono min-w-[60px] text-right text-[10px] uppercase tracking-[0.06em]"
        style={{ color: s.color }}
      >
        {s.label}
      </span>
    </div>
  );
}
