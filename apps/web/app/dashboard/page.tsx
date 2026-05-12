import { Plus, RefreshCw } from "lucide-react";
import type { Metadata } from "next";

import { IntentRanking } from "@/components/dashboard/intent-ranking";
import { LegendDot } from "@/components/dashboard/legend-dot";
import { MetricGrid } from "@/components/dashboard/metric-card";
import { RecentConversations } from "@/components/dashboard/recent-conversations";
import { SectionHeader } from "@/components/dashboard/section-header";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { Button } from "@/components/ui/button";
import { getOverview } from "@/lib/dashboard";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Visão geral — ${SITE.name}`,
};

export default async function DashboardOverviewPage() {
  const overview = await getOverview();

  return (
    <div className="px-8 py-8">
      <SectionHeader
        title={`Oi, ${overview.greetingName}`}
        subtitle="Sua assistente tá trabalhando. Aqui o que rolou hoje."
        actions={
          <>
            <Button variant="outline" size="sm">
              <RefreshCw className="size-3.5" /> Atualizar
            </Button>
            <Button size="sm">
              <Plus className="size-3.5" /> Nova conversa
            </Button>
          </>
        }
      />

      <MetricGrid metrics={overview.metrics} />

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-lg border border-line bg-card p-[22px]">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Volume de conversas</h2>
              <p className="mt-0.5 text-xs text-ink-3">Últimos 7 dias</p>
            </div>
            <div className="flex gap-3.5">
              <LegendDot color="var(--accent)" label="IA" />
              <LegendDot color="var(--ink)" label="Humano" />
            </div>
          </header>
          <VolumeChart data={overview.volume} />
        </section>

        <section className="rounded-lg border border-line bg-card p-[22px]">
          <h2 className="text-[15px] font-semibold">O que estão perguntando</h2>
          <p className="mt-0.5 mb-3.5 text-xs text-ink-3">Top intenções hoje</p>
          <IntentRanking rows={overview.intents} />
        </section>
      </div>

      <RecentConversations items={overview.recent} />
    </div>
  );
}
