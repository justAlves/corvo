import type { AssistantTone, WeekendOption } from "@/lib/onboarding-config";

export type BusinessInfo = {
  name: string;
  category: string;
  phone: string;
  address: string;
  hoursFrom: string;
  hoursTo: string;
  weekend: WeekendOption | "";
  description: string;
};

export type AssistantInfo = {
  name: string;
  tone: AssistantTone;
  avatar: number;
  greeting: string;
  permissions: boolean[];
};

export type OnboardingState = {
  connected: boolean;
  biz: BusinessInfo;
  assistant: AssistantInfo;
};

export type StepId = 0 | 1 | 2 | 3;
