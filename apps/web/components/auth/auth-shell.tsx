import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { AuthTestimonial } from "@/components/auth/auth-testimonial";
import { SITE } from "@/lib/site-config";

interface AuthShellProps {
  eyebrow: string;
  heading: React.ReactNode;
  lede: string;
  children: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  heading,
  lede,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative flex flex-col overflow-hidden border-b border-border bg-surface px-6 py-8 md:px-10 md:py-12 lg:border-b-0 lg:border-r">
        <Link href="/" className="flex items-center gap-2 self-start">
          <BrandMark size={28} />
          <span className="text-[20px] font-semibold tracking-[-0.02em]">
            {SITE.name}
          </span>
        </Link>

        <div className="my-10 flex max-w-[440px] flex-1 flex-col justify-center lg:my-0">
          <div className="mono mb-4 text-[11px] uppercase tracking-[0.1em] text-ink-3">
            {eyebrow}
          </div>
          <h1 className="m-0 font-semibold leading-[1.1] tracking-[-0.035em] text-balance text-[clamp(34px,5vw,56px)] pb-1">
            {heading}
          </h1>
          <p className="mt-5 max-w-[440px] text-[15px] leading-[1.5] text-ink-2">
            {lede}
          </p>

          <AuthTestimonial className="mt-8 hidden md:block" />
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-3">
          <span>© 2026 {SITE.name}</span>
          <span aria-hidden>·</span>
          <a className="hover:text-foreground" href="#">
            Termos
          </a>
          <a className="hover:text-foreground" href="#">
            Privacidade
          </a>
          <a className="hover:text-foreground" href="#">
            Status
          </a>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-10 md:px-10 md:py-14">
        <div className="w-full max-w-[420px] overflow-hidden rounded-[16px] border border-border bg-card shadow-sm animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
