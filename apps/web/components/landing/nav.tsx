import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/site-config";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={28} />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/cadastro" className="gap-1.5">
              Começar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
