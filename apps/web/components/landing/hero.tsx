import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

import { ChatPreview } from "@/components/landing/chat-preview";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { HERO } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28 lg:pb-24 lg:pt-32">
      <HeroGlow />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-[780px] animate-fade-up text-center">
          <Chip variant="accent" className="mb-5">
            <MessageCircle className="h-3 w-3" />
            {HERO.eyebrow}
          </Chip>

          <h1 className="text-balance font-serif text-[clamp(44px,7vw,92px)] font-bold leading-[0.98] tracking-[-0.04em]">
            {HERO.h1Before}{" "}
            <span className="inline-block -rotate-[1deg] rounded-[10px] bg-accent px-[0.12em] text-accent-foreground">
              {HERO.h1Accent}
            </span>{" "}
            {HERO.h1After}
          </h1>

          <p className="mx-auto mt-6 max-w-[600px] text-pretty text-[clamp(16px,1.4vw,19px)] leading-[1.5] text-muted-foreground">
            {HERO.sub}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <Button asChild variant="accent" size="lg">
              <Link href="/signup" className="gap-2">
                {HERO.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#produto">{HERO.ctaSecondary}</a>
            </Button>
          </div>

          <div className="mt-7 inline-flex items-center gap-2.5 text-[13px] text-ink-3">
            <AvatarStack />
            <span>{HERO.socialProof}</span>
          </div>
        </div>

        <ChatPreview />
      </div>
    </section>
  );
}

function HeroGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-[-30%] h-[1100px] w-[1100px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent-soft) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

function AvatarStack() {
  const hues = [30, 200, 295, 110];
  return (
    <span className="flex">
      {hues.map((hue, i) => (
        <span
          key={hue}
          aria-hidden
          className="h-6 w-6 rounded-full border-2 border-background"
          style={{
            background: `oklch(0.82 0.14 ${hue})`,
            marginLeft: i === 0 ? 0 : -8,
          }}
        />
      ))}
    </span>
  );
}
