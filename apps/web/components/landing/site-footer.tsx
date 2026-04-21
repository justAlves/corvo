import { BrandMark } from "@/components/brand-mark";
import { SITE } from "@/lib/site-config";

const links = ["Termos", "Privacidade", "Status", "Contato"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10 text-xs text-ink-3">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BrandMark size={18} />
          <span className="font-mono uppercase tracking-[0.08em]">
            {SITE.name} · 2026
          </span>
        </div>

        <nav className="flex flex-wrap gap-5">
          {links.map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
