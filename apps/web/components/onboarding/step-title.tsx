interface StepTitleProps {
  k: string;
  title: string;
  sub: string;
}

export function StepTitle({ k, title, sub }: StepTitleProps) {
  return (
    <div className="animate-fade-up">
      <span className="mono mb-3.5 inline-block rounded-full border border-accent-line bg-accent-soft px-2.5 py-[3px] text-[11px] uppercase tracking-[0.08em] text-accent-foreground dark:text-foreground">
        Passo {k}
      </span>
      <h1 className="font-serif text-[clamp(28px,4vw,36px)] font-bold leading-[1.04] tracking-[-0.03em]">
        {title}
      </h1>
      <p className="mt-2.5 max-w-[600px] text-[16px] leading-[1.5] text-muted-foreground">
        {sub}
      </p>
    </div>
  );
}
