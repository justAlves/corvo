import { FootCta } from "@/components/landing/foot-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/landing/nav";
import { Pricing } from "@/components/landing/pricing";
import { Promises } from "@/components/landing/promises";
import { SiteFooter } from "@/components/landing/site-footer";
import { UseCases } from "@/components/landing/use-cases";

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Promises />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <FootCta />
      </main>
      <SiteFooter />
    </>
  );
}
