import type { Metadata } from "next";

import { SectionHeader } from "@/components/dashboard/section-header";
import { PlanCard } from "@/components/dashboard/settings/plan-card";
import { WhatsappSettingsPanel } from "@/components/dashboard/whatsapp-settings-panel";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Configurações — ${SITE.name}`,
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5 px-8 py-8">
      <SectionHeader title="Configurações" />
      <WhatsappSettingsPanel />
      <PlanCard />
    </div>
  );
}
