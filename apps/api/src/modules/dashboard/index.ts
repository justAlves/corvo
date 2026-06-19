import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import Elysia, { t } from "elysia";

import { drizzle } from "../../config/db";
import { conversation } from "../../shared/tables/conversation.table";
import { AuthGuard } from "../auth";

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

// Brazil is always UTC-3 (no daylight saving since 2019)
const BRAZIL_OFFSET_MS = -3 * 60 * 60 * 1000;

function toBrazilDate(utcMs: number): { y: number; m: number; d: number } {
  const d = new Date(utcMs + BRAZIL_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

/** "YYYY-MM-DD" → UTC timestamp of that day's midnight in Brazil (= UTC+3h) */
function brazilDateToUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number) as [number, number, number];
  // Brazil midnight = 03:00 UTC
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0, 0));
}

/** Today's date in Brazil as "YYYY-MM-DD" */
function todayBrazil(): string {
  const { y, m, d } = toBrazilDate(Date.now());
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Add N days to a "YYYY-MM-DD" string */
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number) as [number, number, number];
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + n);
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}-${String(base.getUTCDate()).padStart(2, "0")}`;
}

function mapStatus(status: string): "IA" | "Humano" | "Aguardando" {
  if (status === "ai") return "IA";
  if (status === "human") return "Humano";
  return "Aguardando";
}

function colorForJid(jid: string): string {
  let hash = 0;
  for (let i = 0; i < jid.length; i++) {
    hash = (hash * 31 + jid.charCodeAt(i)) >>> 0;
  }
  return `oklch(0.82 0.14 ${hash % 360})`;
}

function relativeTime(date: Date | null): string {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return "—";
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export const DashboardModule = new Elysia({
  name: "dashboard",
  prefix: "/dashboard",
})
  .use(AuthGuard)
  .guard({ auth: true }, (app) =>
    app.get(
      "/overview",
      async ({ user, query }) => {
        const today = todayBrazil();

        const fromDate = query.from ?? today;
        const toDate = query.to ?? fromDate;

        // Exclusive upper bound: next day's Brazil midnight in UTC
        const fromTs = brazilDateToUtc(fromDate);
        const toTs = brazilDateToUtc(addDays(toDate, 1));

        // Previous period: same length, ending just before fromDate
        const periodDays =
          (toTs.getTime() - fromTs.getTime()) / 86_400_000;
        const prevFromTs = new Date(fromTs.getTime() - periodDays * 86_400_000);
        const prevToTs = fromTs;

        // 7 days ending at toTs (for volume chart)
        const chartStart = new Date(toTs.getTime() - 7 * 86_400_000);

        const greetingName = user.name.split(" ")[0];

        // ── current + previous period conversations ───────────────────────
        const [currRows, prevRows] = await Promise.all([
          drizzle
            .select({ id: conversation.id, status: conversation.status })
            .from(conversation)
            .where(
              and(
                eq(conversation.userId, user.id),
                gte(conversation.lastMessageAt, fromTs),
                lt(conversation.lastMessageAt, toTs),
              ),
            ),
          drizzle
            .select({ id: conversation.id, status: conversation.status })
            .from(conversation)
            .where(
              and(
                eq(conversation.userId, user.id),
                gte(conversation.lastMessageAt, prevFromTs),
                lt(conversation.lastMessageAt, prevToTs),
              ),
            ),
        ]);

        const currCount = currRows.length;
        const currAi = currRows.filter((c) => c.status === "ai").length;
        const automationPct =
          currCount > 0 ? Math.round((currAi / currCount) * 100) : 0;
        const waitingCount = currRows.filter(
          (c) => c.status === "waiting",
        ).length;

        const prevCount = prevRows.length;
        const prevAi = prevRows.filter((c) => c.status === "ai").length;
        const prevAutomation =
          prevCount > 0 ? Math.round((prevAi / prevCount) * 100) : 0;

        const convDeltaVal =
          prevCount > 0
            ? Math.round(((currCount - prevCount) / prevCount) * 100)
            : 0;
        const convDelta =
          currCount === 0 && prevCount === 0
            ? "—"
            : `${convDeltaVal >= 0 ? "+" : ""}${convDeltaVal}%`;

        const automationDiff = automationPct - prevAutomation;
        const automationDelta =
          currCount === 0 && prevCount === 0
            ? "—"
            : `${automationDiff >= 0 ? "+" : ""}${automationDiff} pp`;

        const waitingDelta =
          waitingCount > 0 ? `+${waitingCount}` : `${waitingCount}`;

        // ── avg response time ─────────────────────────────────────────────
        const avgQuery = (from: Date, to: Date) =>
          drizzle.execute(sql`
            WITH pairs AS (
              SELECT
                c.created_at AS customer_at,
                (
                  SELECT a.created_at FROM message a
                  WHERE a.conversation_id = c.conversation_id
                    AND a.role = 'assistant'
                    AND a.created_at > c.created_at
                  ORDER BY a.created_at
                  LIMIT 1
                ) AS reply_at
              FROM message c
              JOIN conversation cv ON cv.id = c.conversation_id
              WHERE cv.user_id = ${user.id}
                AND c.role = 'customer'
                AND c.created_at >= ${from}
                AND c.created_at < ${to}
            )
            SELECT ROUND(AVG(EXTRACT(EPOCH FROM (reply_at - customer_at))))::int AS avg_seconds
            FROM pairs
            WHERE reply_at IS NOT NULL
          `);

        const [avgCurr, avgPrev] = await Promise.all([
          avgQuery(fromTs, toTs),
          avgQuery(prevFromTs, prevToTs),
        ]);

        const avgSec = Number(
          (avgCurr.rows[0] as { avg_seconds: unknown })?.avg_seconds ?? 0,
        );
        const avgSecPrev = Number(
          (avgPrev.rows[0] as { avg_seconds: unknown })?.avg_seconds ?? 0,
        );
        const avgDisplay =
          avgSec === 0
            ? "—"
            : avgSec < 60
              ? `${avgSec}s`
              : `${Math.round(avgSec / 60)}m`;
        const avgDiff = avgSec - avgSecPrev;
        const avgDelta =
          avgSec === 0 && avgSecPrev === 0
            ? "—"
            : `${avgDiff >= 0 ? "+" : ""}${avgDiff}s`;

        // ── metrics ───────────────────────────────────────────────────────
        const metrics = [
          {
            key: "conversations",
            label: "Conversas no período",
            value: String(currCount),
            delta: convDelta,
            icon: "inbox",
          },
          {
            key: "automation",
            label: "Respondidas pela IA",
            value: `${automationPct}%`,
            delta: automationDelta,
            icon: "spark",
          },
          {
            key: "avgTime",
            label: "Tempo médio",
            value: avgDisplay,
            delta: avgDelta,
            icon: "clock",
          },
          {
            key: "bookings",
            label: "Aguardando",
            value: String(waitingCount),
            delta: waitingDelta,
            icon: "calendar",
          },
        ];

        // ── volume chart (7 days ending at toTs) ─────────────────────────
        const volumeResult = await drizzle.execute(sql`
          SELECT
            date_trunc('day', m.created_at) AS day,
            COUNT(*) FILTER (WHERE m.role = 'assistant') AS ai_count,
            COUNT(*) FILTER (WHERE m.role = 'agent')     AS human_count
          FROM message m
          JOIN conversation cv ON cv.id = m.conversation_id
          WHERE cv.user_id = ${user.id}
            AND m.created_at >= ${chartStart}
            AND m.created_at < ${toTs}
          GROUP BY 1
          ORDER BY 1
        `);

        const volumeMap = new Map<string, { ai: number; human: number }>();
        for (const row of volumeResult.rows as {
          day: string;
          ai_count: string;
          human_count: string;
        }[]) {
          const key = new Date(row.day).toISOString().slice(0, 10);
          volumeMap.set(key, {
            ai: Number(row.ai_count),
            human: Number(row.human_count),
          });
        }

        const volume = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(chartStart.getTime() + i * 86_400_000);
          const key = d.toISOString().slice(0, 10);
          const data = volumeMap.get(key) ?? { ai: 0, human: 0 };
          return { day: DAYS_PT[d.getUTCDay()], ai: data.ai, human: data.human };
        });

        // ── intents (placeholder — requires AI extraction pipeline) ───────
        const intents = [
          { label: "Agendar horário", pct: 42 },
          { label: "Horário/endereço", pct: 28 },
          { label: "Preços", pct: 17 },
          { label: "Pedido/entrega", pct: 9 },
          { label: "Outros", pct: 4 },
        ];

        // ── recent conversations ──────────────────────────────────────────
        const recentRows = await drizzle
          .select()
          .from(conversation)
          .where(eq(conversation.userId, user.id))
          .orderBy(desc(conversation.lastMessageAt))
          .limit(4);

        const recent = recentRows.map((c) => ({
          id: c.id,
          name: c.contactName ?? c.contactPhone ?? c.contactJid,
          phone: c.contactPhone
            ? `+${c.contactPhone}`
            : c.contactJid.split("@")[0],
          color: colorForJid(c.contactJid),
          preview: c.lastMessagePreview,
          status: mapStatus(c.status),
          time: relativeTime(c.lastMessageAt),
          messages: [],
          customer: {
            since: c.createdAt.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            }),
            totalConversations: 1,
            lastBooking: "—",
            ltv: "R$ 0",
          },
        }));

        return { greetingName, metrics, volume, intents, recent };
      },
      {
        query: t.Object({
          from: t.Optional(
            t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
          ),
          to: t.Optional(
            t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
          ),
        }),
      },
    ),
  );
