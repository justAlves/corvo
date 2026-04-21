import { SectionLabel } from "@/components/landing/section-label";
import { Chip } from "@/components/ui/chip";
import { USE_CASES } from "@/lib/site-config";

export function UseCases() {
  return (
    <section id="clientes" className="px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionLabel>Quem já usa</SectionLabel>
        <h2 className="mt-4 max-w-3xl text-balance font-serif text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-0.035em]">
          {USE_CASES.title}
        </h2>

        <div className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.items.map((item, i) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl border border-border bg-background"
            >
              <Thumb hue={(i * 61) % 360} />
              <div className="p-4">
                <Chip className="mb-2">{item.tag}</Chip>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[13px] leading-[1.5] text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Thumb({ hue }: { hue: number }) {
  return (
    <div className="relative h-[140px] overflow-hidden">
      <div
        className="absolute inset-0 opacity-90"
        style={{ background: `oklch(0.9 0.08 ${hue})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.04) 8px 10px)",
        }}
      />
      <span className="absolute inset-0 grid place-items-center font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2">
        foto do cliente
      </span>
    </div>
  );
}
