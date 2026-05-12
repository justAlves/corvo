import type { Metadata } from "next";

import { InboxShell } from "@/components/dashboard/inbox/inbox-shell";
import { SITE } from "@/lib/site-config";

interface InboxPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Caixa de entrada — ${SITE.name}` };
}

export default async function InboxConversationPage({ params }: InboxPageProps) {
  const { id } = await params;
  return <InboxShell selectedId={id} />;
}
