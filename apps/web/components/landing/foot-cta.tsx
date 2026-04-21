import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FOOT_CTA } from "@/lib/site-config";

export function FootCta() {
  return (
    <section className="bg-foreground px-6 py-24 text-background lg:py-32">
      <div className="mx-auto max-w-[800px] text-center">
        <h2 className="font-serif text-[clamp(36px,6vw,68px)] font-bold leading-[1.02] tracking-[-0.035em]">
          {FOOT_CTA.title}
        </h2>
        <p className="mt-3.5 text-[17px] text-background/70">{FOOT_CTA.body}</p>
        <Button asChild variant="accent" size="lg" className="mt-6">
          <Link href="/signup" className="gap-2">
            {FOOT_CTA.button}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
