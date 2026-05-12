"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { SITE } from "@/lib/site-config";
import type { ObStep } from "@/lib/onboarding-config";
import { cn } from "@/lib/utils";

interface OnboardingHeaderProps {
  steps: ObStep[];
  current: number;
}

export function OnboardingHeader({ steps, current }: OnboardingHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-line bg-background px-6 py-3.5 backdrop-blur-sm">
      <Link
        href="/"
        className="group flex items-center gap-2 text-ink-2 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 -translate-x-0 transition-transform group-hover:-translate-x-0.5" />
        <div className="flex items-center gap-2">
          <BrandMark size={24} />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
            {SITE.name}
          </span>
        </div>
      </Link>

      <div className="hidden items-center gap-2.5 md:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={s.k} className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center gap-2 transition-opacity duration-300",
                  !active && !done && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "grid h-[26px] w-[26px] place-items-center rounded-full border text-[10px] font-semibold transition-all duration-300",
                    done &&
                      "border-transparent bg-foreground text-background",
                    active &&
                      "border-transparent bg-accent text-accent-foreground shadow-[0_0_0_4px_var(--accent-soft)]",
                    !done && !active && "border-line bg-surface-2 text-ink-3",
                  )}
                >
                  {done ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : (
                    <span className="mono">{s.k}</span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[13px] transition-colors",
                    active ? "font-semibold text-foreground" : "font-medium text-ink-2",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className="h-px w-6 bg-line-strong" />
              )}
            </div>
          );
        })}
      </div>

      <span className="mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
        Passo {current + 1} / {steps.length}
      </span>
    </header>
  );
}
