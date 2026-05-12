"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { OnboardingFooter } from "@/components/onboarding/onboarding-footer";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { StepAssistant } from "@/components/onboarding/step-assistant";
import { StepBusiness } from "@/components/onboarding/step-business";
import { StepConnect } from "@/components/onboarding/step-connect";
import { StepPlayground } from "@/components/onboarding/step-playground";
import type {
  AssistantInfo,
  BusinessInfo,
  OnboardingState,
  StepId,
} from "@/components/onboarding/types";
import { ApiError } from "@/lib/api";
import type { KnowledgeItem } from "@/lib/knowledge";
import {
  DEFAULT_PERMISSIONS,
  ONBOARDING_STEPS,
  PERMISSION_KEYS,
  WEEKEND_LABEL_TO_SERVER,
  WEEKEND_SERVER_TO_LABEL,
  type WeekendOption,
} from "@/lib/onboarding-config";
import {
  completeOnboarding,
  getOnboardingState,
  saveOnboardingAssistant,
  saveOnboardingBusiness,
  type OnboardingAssistant,
  type OnboardingBusiness,
} from "@/lib/onboarding";

const INITIAL_STATE: OnboardingState = {
  connected: false,
  biz: {
    name: "",
    category: "",
    phone: "",
    address: "",
    hoursFrom: "09:00",
    hoursTo: "18:00",
    weekend: "",
    description: "",
  },
  assistant: {
    name: "Lia",
    tone: "descolada",
    avatar: 0,
    greeting: "Oi! Sou a Lia, posso te ajudar?",
    permissions: DEFAULT_PERMISSIONS.map((p) => p.on),
  },
};

function permissionsArrayToObject(arr: boolean[]) {
  const defaults = DEFAULT_PERMISSIONS.map((p) => p.on);
  return PERMISSION_KEYS.reduce(
    (acc, key, i) => {
      acc[key] = arr[i] ?? defaults[i] ?? false;
      return acc;
    },
    {} as Record<(typeof PERMISSION_KEYS)[number], boolean>,
  );
}

function permissionsObjectToArray(
  obj: Partial<Record<(typeof PERMISSION_KEYS)[number], boolean>> | undefined,
) {
  const defaults = DEFAULT_PERMISSIONS.map((p) => p.on);
  return PERMISSION_KEYS.map((key, i) => obj?.[key] ?? defaults[i] ?? false);
}

function bizToServer(biz: BusinessInfo): OnboardingBusiness {
  return {
    name: biz.name,
    category: biz.category,
    phone: biz.phone,
    address: biz.address,
    hoursFrom: biz.hoursFrom,
    hoursTo: biz.hoursTo,
    weekend: biz.weekend ? WEEKEND_LABEL_TO_SERVER[biz.weekend] : "",
    description: biz.description,
  };
}

function assistantToServer(a: AssistantInfo): OnboardingAssistant {
  return {
    name: a.name.trim(),
    tone: a.tone,
    avatar: a.avatar,
    greeting: a.greeting,
    permissions: permissionsArrayToObject(a.permissions),
  };
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>(0);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [hydrating, setHydrating] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await getOnboardingState();
        if (cancelled) return;
        if (remote.completed) {
          router.push("/dashboard");
          return;
        }
        setKnowledge(remote.knowledge ?? []);
        setState((current) => ({
          connected: remote.whatsapp?.status === "connected",
          biz: remote.business
            ? {
                name: remote.business.name,
                category: remote.business.category,
                phone: remote.business.phone,
                address: remote.business.address,
                hoursFrom: remote.business.hoursFrom,
                hoursTo: remote.business.hoursTo,
                weekend: remote.business.weekend
                  ? (WEEKEND_SERVER_TO_LABEL[
                      remote.business.weekend
                    ] as WeekendOption)
                  : "",
                description: remote.business.description,
              }
            : current.biz,
          assistant: remote.assistant
            ? {
                name: remote.assistant.name,
                tone: remote.assistant.tone,
                avatar: remote.assistant.avatar,
                greeting: remote.assistant.greeting,
                permissions: permissionsObjectToArray(
                  remote.assistant.permissions,
                ),
              }
            : current.assistant,
        }));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
          return;
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const updateBiz = useCallback((patch: Partial<BusinessInfo>) => {
    setState((s) => ({ ...s, biz: { ...s.biz, ...patch } }));
  }, []);

  const addKnowledge = useCallback((item: KnowledgeItem) => {
    setKnowledge((prev) => [item, ...prev.filter((x) => x.id !== item.id)]);
  }, []);

  const removeKnowledge = useCallback((id: string) => {
    setKnowledge((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const updateAssistant = useCallback((patch: Partial<AssistantInfo>) => {
    setState((s) => ({ ...s, assistant: { ...s.assistant, ...patch } }));
  }, []);

  const onConnected = useCallback(() => {
    setState((s) => ({ ...s, connected: true }));
  }, []);

  const canNext = (() => {
    switch (step) {
      case 0:
        return state.connected;
      case 1:
        return !!state.biz.name && !!state.biz.category;
      case 2:
        return !!state.assistant.name.trim();
      case 3:
        return true;
    }
  })();

  const onBack = () => {
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep((s) => (s - 1) as StepId);
  };

  const onNext = async () => {
    if (!canNext || submitting) return;
    setSubmitting(true);
    try {
      if (step === 1) {
        await saveOnboardingBusiness(bizToServer(state.biz));
        setStep(2);
        return;
      }
      if (step === 2) {
        await saveOnboardingAssistant(assistantToServer(state.assistant));
        setStep(3);
        return;
      }
      if (step === 3) {
        await completeOnboarding();
        toast.success("Assistente publicada!", {
          description: "Tudo pronto — sua assistente já tá atendendo.",
        });
        router.push("/dashboard");
        return;
      }
      setStep((s) => (s + 1) as StepId);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não consegui salvar agora.";
      toast.error("Ops, algo deu errado", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <OnboardingHeader steps={ONBOARDING_STEPS} current={step} />

      <main className="flex-1 overflow-x-hidden">
        <div
          key={step}
          className="mx-auto w-full max-w-[920px] animate-fade-up px-6 py-10 md:py-14"
        >
          {hydrating ? (
            <div className="mono py-16 text-center text-[12px] uppercase tracking-[0.08em] text-ink-3">
              carregando…
            </div>
          ) : (
            <>
              {step === 0 && (
                <StepConnect
                  connected={state.connected}
                  onConnected={onConnected}
                />
              )}
              {step === 1 && (
                <StepBusiness
                  biz={state.biz}
                  update={updateBiz}
                  knowledge={knowledge}
                  onKnowledgeAdd={addKnowledge}
                  onKnowledgeRemove={removeKnowledge}
                />
              )}
              {step === 2 && (
                <StepAssistant state={state} update={updateAssistant} />
              )}
              {step === 3 && (
                <StepPlayground state={state} knowledge={knowledge} />
              )}
            </>
          )}
        </div>
      </main>

      <OnboardingFooter
        step={step}
        total={ONBOARDING_STEPS.length}
        canNext={canNext && !submitting}
        onBack={onBack}
        onNext={onNext}
      />
    </div>
  );
}
