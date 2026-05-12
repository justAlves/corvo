"use client";

import { AssistantPreview } from "@/components/onboarding/assistant-preview";
import { Field } from "@/components/onboarding/field";
import { StepTitle } from "@/components/onboarding/step-title";
import { ToggleSwitch } from "@/components/onboarding/toggle-switch";
import type {
  AssistantInfo,
  OnboardingState,
} from "@/components/onboarding/types";
import { Input } from "@/components/ui/input";
import {
  ASSISTANT_AVATARS,
  ASSISTANT_TONES,
  DEFAULT_PERMISSIONS,
} from "@/lib/onboarding-config";
import { cn } from "@/lib/utils";

interface StepAssistantProps {
  state: OnboardingState;
  update: (patch: Partial<AssistantInfo>) => void;
}

export function StepAssistant({ state, update }: StepAssistantProps) {
  const permissions = state.assistant.permissions;

  const togglePermission = (i: number) => {
    const next = [...permissions];
    next[i] = !next[i];
    update({ permissions: next });
  };

  return (
    <div>
      <StepTitle
        k="03"
        title="Dá personalidade pra assistente"
        sub="Ela vai atender em nome do teu negócio — escolhe um jeitão."
      />

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex animate-fade-up flex-col gap-4">
          <Field
            label="Nome da assistente"
            hint="Os clientes vão chamar ela por esse nome."
          >
            <Input
              value={state.assistant.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Lia"
            />
          </Field>

          <Field label="Avatar">
            <div className="flex flex-wrap gap-2">
              {ASSISTANT_AVATARS.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => update({ avatar: i })}
                  aria-label={`Avatar ${i + 1}`}
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full text-[22px] text-[oklch(0.2_0.01_250)] transition-[transform,box-shadow] duration-200 active:scale-95",
                    state.assistant.avatar === i
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-md"
                      : "ring-2 ring-transparent hover:scale-105",
                  )}
                  style={{ background: a.bg }}
                >
                  {a.face}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Tom de voz">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {ASSISTANT_TONES.map((t) => (
                <ToneCard
                  key={t.k}
                  label={t.label}
                  sample={t.sample}
                  active={state.assistant.tone === t.k}
                  onClick={() => update({ tone: t.k })}
                />
              ))}
            </div>
          </Field>

          <Field label="Mensagem de boas-vindas">
            <textarea
              value={state.assistant.greeting}
              onChange={(e) => update({ greeting: e.target.value })}
              rows={2}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-line-strong bg-background px-3 py-2.5 text-sm font-sans leading-[1.55] tracking-[-0.005em] outline-none transition-[border-color,box-shadow] duration-150",
                "placeholder:text-ink-3",
                "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent-soft",
              )}
            />
          </Field>

          <Field label="Permissões">
            <div className="flex flex-col gap-1.5">
              {DEFAULT_PERMISSIONS.map((p, i) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-background px-3 py-2.5"
                >
                  <span className="text-[13px]">{p.label}</span>
                  <ToggleSwitch
                    checked={permissions[i] ?? p.on}
                    onChange={() => togglePermission(i)}
                    label={p.label}
                  />
                </div>
              ))}
            </div>
          </Field>
        </div>

        <div
          className="animate-fade-up"
          style={{ animationDelay: "90ms" }}
        >
          <AssistantPreview state={state} />
        </div>
      </div>
    </div>
  );
}

function ToneCard({
  label,
  sample,
  active,
  onClick,
}: {
  label: string;
  sample: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]",
        active
          ? "border-accent-line bg-accent-soft text-accent-foreground dark:text-foreground"
          : "border-line bg-background hover:border-line-strong",
      )}
    >
      <p className="text-[13px] font-semibold">{label}</p>
      <p
        className={cn(
          "mt-0.5 italic text-[11px]",
          active ? "opacity-80" : "text-ink-3",
        )}
      >
        &ldquo;{sample}&rdquo;
      </p>
    </button>
  );
}
