import Link from "next/link";

import { cn } from "@/lib/utils";

type Mode = "login" | "cadastro";

const tabs: { mode: Mode; href: string; label: string }[] = [
  { mode: "login", href: "/login", label: "Entrar" },
  { mode: "cadastro", href: "/cadastro", label: "Criar conta" },
];

export function AuthCardTabs({ active }: { active: Mode }) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-surface-2 p-[3px]">
      {tabs.map((tab) => {
        const isActive = tab.mode === active;
        return (
          <Link
            key={tab.mode}
            href={tab.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
              isActive
                ? "bg-background text-foreground font-semibold shadow-sm"
                : "text-ink-2 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
