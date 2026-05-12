import { Pencil } from "lucide-react";
import type { Metadata } from "next";

import { AssistantProfileCard } from "@/components/dashboard/assistant/profile-card";
import { KnowledgeCard } from "@/components/dashboard/assistant/knowledge-card";
import { WelcomeMessageCard } from "@/components/dashboard/assistant/welcome-message-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Button } from "@/components/ui/button";
import { getAssistantPage } from "@/lib/dashboard";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Assistente — ${SITE.name}`,
};

export default async function AssistantPage() {
  const { assistant, knowledge } = await getAssistantPage();

  return (
    <div className="px-8 py-8">
      <SectionHeader
        title="Sua assistente"
        subtitle="Ajuste personalidade, conhecimento e permissões — sem derrubar o serviço."
        actions={
          <Button>
            <Pencil className="size-3.5" /> Editar completo
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <AssistantProfileCard assistant={assistant} />
        <KnowledgeCard rows={knowledge} />
        <WelcomeMessageCard initialValue={assistant.greeting} />
      </div>
    </div>
  );
}
