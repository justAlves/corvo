import type { Metadata } from "next";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Onboarding — ${SITE.name}`,
  description: "Configure sua assistente de IA em 4 passos.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
