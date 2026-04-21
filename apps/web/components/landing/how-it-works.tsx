import { SectionLabel } from "@/components/landing/section-label";
import { HOW } from "@/lib/site-config";

export function HowItWorks() {
  return (
    <section className="bg-surface px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionLabel>Como funciona</SectionLabel>
        <h2 className="mt-4 text-balance font-serif text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-0.035em]">
          {HOW.title}
        </h2>
        <p className="mt-3.5 max-w-xl text-pretty text-[17px] text-muted-foreground">
          {HOW.subtitle}
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.steps.map((s) => (
            <article
              key={s.k}
              className="flex flex-col rounded-2xl border border-border bg-background p-6"
            >
              <span className="self-start rounded-sm border border-accent-line bg-accent-soft px-2 py-[2px] font-mono text-xs text-accent-foreground">
                {s.k}
              </span>
              <h3 className="mt-3.5 text-lg font-semibold tracking-[-0.015em]">
                {s.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-muted-foreground">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
