"use client";

import {
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { WhatsappStatusCard } from "@/components/dashboard/whatsapp-status-card";
import { listInboxConversations } from "@/lib/inbox";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  matchPrefix?: boolean;
}

const POLL_MS = 10_000;

export function DashboardSidebar() {
  const pathname = usePathname();
  const [inboxCount, setInboxCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await listInboxConversations();
        const active = res.items.filter((c) => c.status !== "closed").length;
        setInboxCount(active);
      } catch {
        // ignore — badge simply won't show
      }
    }
    void fetchCount();
    const t = setInterval(fetchCount, POLL_MS);
    return () => clearInterval(t);
  }, []);

  const NAV: NavItem[] = [
    { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
    {
      href: "/dashboard/inbox",
      label: "Caixa de entrada",
      icon: Inbox,
      badge: inboxCount ?? undefined,
      matchPrefix: true,
    },
    { href: "/dashboard/assistant", label: "Assistente", icon: Sparkles, matchPrefix: true },
    { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-background p-[18px]">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-surface-2"
      >
        <BrandMark size={24} />
        <span className="text-base font-semibold tracking-[-0.02em]">
          {SITE.name}
        </span>
      </Link>

      <nav className="mt-6">
        <div className="mono mb-1.5 px-2 text-[10px] uppercase tracking-[0.1em] text-ink-3">
          Menu
        </div>
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = item.matchPrefix
              ? pathname.startsWith(item.href)
              : pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-surface-2 font-semibold text-ink"
                      : "font-medium text-ink-2 hover:bg-surface-2/60 hover:text-ink",
                  )}
                >
                  <item.icon className="size-[15px]" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="mono rounded-full bg-accent px-1.5 py-px text-[10px] text-accent-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <WhatsappStatusCard />
    </aside>
  );
}
