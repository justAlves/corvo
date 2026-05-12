import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-5">
      <div>
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-ink-2">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
