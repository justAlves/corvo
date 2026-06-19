import type { Metadata } from "next";
import { Suspense } from "react";

import { IntentRanking } from "@/components/dashboard/intent-ranking";
import { LegendDot } from "@/components/dashboard/legend-dot";
import { MetricGrid } from "@/components/dashboard/metric-card";
import {
  PeriodSelect,
  type Period,
} from "@/components/dashboard/period-select";
import { RecentConversations } from "@/components/dashboard/recent-conversations";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { SectionHeader } from "@/components/dashboard/section-header";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { getOverview } from "@/lib/dashboard";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Visão geral — ${SITE.name}`,
};

// Brazil is always UTC-3
const BR_OFFSET = -3 * 60 * 60 * 1000;

function todayBR(): string {
  const d = new Date(Date.now() + BR_OFFSET);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + n);
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}-${String(base.getUTCDate()).padStart(2, "0")}`;
}

function periodToDates(period: Period): { from: string; to: string } {
  const today = todayBR();
  const yesterday = addDays(today, -1);
  switch (period) {
    case "today":
      return { from: today, to: today };
    case "yesterday":
      return { from: yesterday, to: yesterday };
    case "7d":
      return { from: addDays(today, -6), to: today };
    case "30d":
      return { from: addDays(today, -29), to: today };
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardOverviewPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.period) ? params.period[0] : params.period;
  const period: Period =
    raw === "yesterday" || raw === "7d" || raw === "30d" ? raw : "today";

  const { from, to } = periodToDates(period);
  const overview = await getOverview(from, to);

  return (
    <div className="px-8 py-8">
      <SectionHeader
        title={`Oi, ${overview.greetingName}`}
        subtitle="Sua assistente tá trabalhando. Aqui o que rolou."
        actions={
          <>
            <Suspense>
              <PeriodSelect current={period} />
            </Suspense>
            <RefreshButton />
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
