"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { VolumePoint } from "@/lib/dashboard";

const config = {
  ai: { label: "IA", color: "var(--accent)" },
  human: { label: "Humano", color: "var(--ink)" },
} satisfies ChartConfig;

export function VolumeChart({ data }: { data: VolumePoint[] }) {
  return (
    <ChartContainer config={config} className="mt-5 aspect-auto h-[180px] w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{
            fill: "var(--ink-3)",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
          }}
        />
        <ChartTooltip cursor={{ fill: "var(--surface-2)" }} content={<ChartTooltipContent />} />
        <Bar dataKey="ai" stackId="a" fill="var(--color-ai)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="human" stackId="a" fill="var(--color-human)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
