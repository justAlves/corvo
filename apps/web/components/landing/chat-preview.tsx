import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type Bubble = { from: "them" | "ai"; text: string };

const conversations = [
  { name: "Marina L.", msg: "Tem horário terça?", time: "agora", unread: true, hue: 40 },
  { name: "João R.", msg: "Quero 2 pizzas grandes", time: "2m", unread: true, hue: 100 },
  { name: "Ana P.", msg: "Obrigada!", time: "8m", unread: false, hue: 160 },
  { name: "Studio Alma", msg: "Confirmação enviada", time: "12m", unread: false, hue: 220 },
  { name: "+55 11 9•••", msg: "Vocês entregam na Mooca?", time: "20m", unread: false, hue: 280 },
];

const thread: Bubble[] = [
  { from: "them", text: "Oi, vocês têm horário terça de manhã pra limpeza?" },
  {
    from: "ai",
    text: "Oi Marina! Tenho sim 👋 Terça tenho 9:15 com a Dra. Carla e 10:30 com o Dr. Paulo. Prefere algum?",
  },
  { from: "them", text: "9:15 com a Carla" },
  { from: "ai", text: "Reservado! Te mando lembrete na segunda. 💚" },
];

export function ChatPreview() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-line-strong bg-background shadow-2xl shadow-black/10 dark:shadow-black/40">
        <BrowserBar />
        <div className="grid h-[420px] grid-cols-[240px_1fr]">
          <Sidebar />
          <Thread />
        </div>
      </div>
    </div>
  );
}

function BrowserBar() {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-3.5 py-2.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-line-strong"
          />
        ))}
      </div>
      <span className="rounded border border-border bg-surface-2 px-2.5 py-[3px] font-mono text-[11px] text-ink-3">
        {SITE.domain.toLowerCase()}/app
      </span>
      <span className="w-8" />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="flex flex-col gap-1 overflow-hidden border-r border-border p-3.5">
      <span className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
        Conversas
      </span>
      {conversations.map((conv, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5"
        >
          <span
            aria-hidden
            className="h-[30px] w-[30px] shrink-0 rounded-full"
            style={{ background: `oklch(0.82 0.12 ${conv.hue})` }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              <span className="truncate text-xs font-semibold">
                {conv.name}
              </span>
              <span className="text-[10px] text-ink-3">{conv.time}</span>
            </div>
            <p className="truncate text-[11px] text-ink-3">{conv.msg}</p>
          </div>
          {conv.unread && (
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
          )}
        </div>
      ))}
    </aside>
  );
}

function Thread() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2.5 border-b border-border px-4 py-2.5">
        <span
          aria-hidden
          className="h-7 w-7 rounded-full"
          style={{ background: "oklch(0.82 0.12 40)" }}
        />
        <div>
          <div className="text-[13px] font-semibold">Marina L.</div>
          <div className="flex items-center gap-1.5 text-[11px] text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            IA respondendo
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-4">
        {thread.map((b, i) => (
          <Bubble key={i} {...b} />
        ))}
        <div className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-2xl border border-border bg-surface px-3 py-1.5">
          <span className="flex gap-[3px]">
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                className="h-[5px] w-[5px] rounded-full bg-ink-3 animate-typing"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </span>
          <span className="text-[11px] text-ink-3">digitando…</span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ from, text }: Bubble) {
  const isThem = from === "them";
  return (
    <p
      className={cn(
        "max-w-[78%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug",
        isThem
          ? "self-start rounded-bl-sm border border-border bg-surface text-foreground"
          : "self-end rounded-br-sm bg-accent-soft text-accent-foreground",
      )}
    >
      {text}
    </p>
  );
}
