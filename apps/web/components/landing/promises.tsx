import { SectionLabel } from "@/components/landing/section-label";
import { PROMISES } from "@/lib/site-config";

export function Promises() {
  return (
    <section id="produto" className="px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionLabel>O que ela faz</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-balance font-serif text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-0.035em]">
          Uma assistente que
          <br />
          faz o trabalho pesado.
        </h2>

        <div className="mt-12 grid overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map((p) => (
            <div
              key={p.title}
              className="flex flex-col gap-2.5 bg-background p-7"
            >
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent-foreground">
                <p.icon className="h-4 w-4" />
              </span>
              <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                {p.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
