"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface OnboardingFooterProps {
  step: number;
  total: number;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function OnboardingFooter({
  step,
  total,
  canNext,
  onBack,
  onNext,
}: OnboardingFooterProps) {
  const isLast = step === total - 1;

  return (
    <footer className="sticky bottom-0 z-20 border-t border-line bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[920px] items-center justify-between gap-4 px-6 py-3.5">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-3.5" />
          Voltar
        </Button>

        <span
          key={canNext ? "ready" : "not-ready"}
          className="mono hidden animate-fade-up text-[11px] uppercase tracking-[0.08em] text-ink-3 sm:inline"
        >
          {canNext ? "Pronto pra seguir" : "Preenche o que falta pra seguir"}
        </span>

        <Button
          variant={canNext ? "accent" : "outline"}
          size="md"
          disabled={!canNext}
          onClick={onNext}
          className="gap-1.5"
        >
          {isLast ? "Publicar assistente" : "Continuar"}
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </footer>
  );
}
