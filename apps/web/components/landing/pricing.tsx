import { Check } from "lucide-react";
import Link from "next/link";

import { SectionLabel } from "@/components/landing/section-label";
import { Button } from "@/components/ui/button";
import { PRICING, type Plan } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="preco" className="bg-surface px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionLabel>Preço</SectionLabel>
        <h2 className="mt-4 text-balance font-serif text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-0.035em]">
          {PRICING.title}
        </h2>

        <div className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING.plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-ink-3">
          {PRICING.footnote}
        </p>
      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  const { highlight } = plan;
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border p-7",
        highlight
          ? "border-accent-line bg-accent-soft text-accent-foreground dark:text-foreground"
          : "border-border bg-background text-foreground",
      )}
    >
      {highlight && (
        <span className="absolute -top-2.5 right-5 rounded-full bg-foreground px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-background">
          Mais popular
        </span>
      )}

      <div className="text-sm font-semibold">{plan.name}</div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-serif text-[34px] font-bold tracking-[-0.03em]">
          {plan.price}
        </span>
        <span
          className={cn("text-[13px]", highlight ? "opacity-80" : "text-ink-3")}
        >
          {plan.period}
        </span>
      </div>

      <p
        className={cn(
          "mt-1.5 text-[13px]",
          highlight ? "opacity-85" : "text-muted-foreground",
        )}
      >
        {plan.body}
      </p>

      <div
        className={cn(
          "my-5 h-px w-full",
          highlight ? "bg-accent-line" : "bg-border",
        )}
      />

      <ul className="flex flex-col gap-1 text-[13px]">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 py-[5px]">
            <Check className="h-3.5 w-3.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={highlight ? "primary" : "outline"}
        className="mt-5 w-full"
      >
        <Link href="/signup">{plan.cta}</Link>
      </Button>
    </article>
  );
}
