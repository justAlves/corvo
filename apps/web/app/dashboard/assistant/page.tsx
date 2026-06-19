import type { Metadata } from "next";

import { AssistantProfileCard } from "@/components/dashboard/assistant/profile-card";
import { BusinessProfileCard } from "@/components/dashboard/assistant/business-profile-card";
import { HoursAddressCard } from "@/components/dashboard/assistant/hours-address-card";
import { KnowledgeCard } from "@/components/dashboard/assistant/knowledge-card";
import { WelcomeMessageCard } from "@/components/dashboard/assistant/welcome-message-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { getAssistantPage } from "@/lib/dashboard";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Assistente — ${SITE.name}`,
};

export default async function AssistantPage() {
  const { assistant, assistantFull, business, knowledge } =
    await getAssistantPage();

  return (
    <div className="px-8 py-8">
      <SectionHeader
        title="Sua assistente"
        subtitle="Ajuste personalidade, conhecimento e permissões — sem derrubar o serviço."
      />

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {/* Left column: profile card with knowledge base embedded at the bottom */}
        <AssistantProfileCard assistant={assistant} className="flex-1">
          <KnowledgeCard rows={knowledge} />
        </AssistantProfileCard>

        {/* Right column: 3 edit cards stacked */}
        <div className="flex flex-col gap-3.5">
          <WelcomeMessageCard assistantFull={assistantFull} />
          <BusinessProfileCard initial={business} />
          <HoursAddressCard initial={business} />
        </div>
      </div>
    </div>
  );
}
