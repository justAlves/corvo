import { cn } from "@/lib/utils";

export function AuthTestimonial({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "max-w-[400px] rounded-xl border border-border bg-background p-[18px]",
        className,
      )}
    >
      <blockquote className="text-[14px] italic leading-[1.55] text-foreground font-serif">
        “Em 6 minutos tava respondendo meus clientes. Passei de 40 ligações por
        dia pra só o que precisa de gente de verdade.”
      </blockquote>
      <figcaption className="mt-3.5 flex items-center gap-2.5">
        <span
          aria-hidden
          className="h-8 w-8 rounded-full"
          style={{ background: "oklch(0.82 0.14 30)" }}
        />
        <div>
          <div className="text-[12px] font-semibold">Sílvio Brambatti</div>
          <div className="text-[11px] text-ink-3">
            Cantina do Sílvio · Mooca, SP
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
