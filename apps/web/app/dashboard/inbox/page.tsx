import type { Metadata } from "next";

import { InboxShell } from "@/components/dashboard/inbox/inbox-shell";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Caixa de entrada — ${SITE.name}`,
};

export default function InboxIndexPage() {
  return <InboxShell />;
}
