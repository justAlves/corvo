import type { Metadata } from "next";

import { BillingPanel } from "@/components/dashboard/billing-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Plano — ${SITE.name}`,
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-5 px-8 py-8">
      <SectionHeader
        title="Plano & Assinatura"
        subtitle="Gerencie sua assinatura e método de pagamento."
      />
      <BillingPanel />
    </div>
  );
}
