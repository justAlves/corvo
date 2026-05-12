import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { SectionHeader } from "@/components/dashboard/section-header";
import { WhatsappSettingsPanel } from "@/components/dashboard/whatsapp-settings-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSettings } from "@/lib/dashboard";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Configurações — ${SITE.name}`,
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-5 px-8 py-8">
      <SectionHeader title="Configurações" />

      <WhatsappSettingsPanel />

      <section className="rounded-lg border border-line bg-card p-[22px]">
        <div className="text-sm font-semibold">Plano</div>
        <p className="text-xs text-ink-3">
          {settings.plan.name} · {settings.plan.price} · renova em{" "}
          {settings.plan.renewsAt}
        </p>

        <Separator className="my-4" />

        <div className="text-sm font-semibold">Time</div>
        <p className="text-xs text-ink-3">
          Convide atendentes humanos pra assumir conversas.
        </p>
        <Button variant="outline" size="sm" className="mt-2.5">
          <Plus className="size-3.5" /> Convidar pessoa
        </Button>
      </section>
    </div>
  );
}
