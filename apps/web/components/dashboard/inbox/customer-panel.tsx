import { Separator } from "@/components/ui/separator";
import {
  type InboxConversationDetail,
  contactDisplayName,
  formatPhone,
  statusLabel,
} from "@/lib/inbox";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="shrink-0 text-ink-3">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

export function CustomerPanel({
  conversation,
}: {
  conversation: InboxConversationDetail | null;
}) {
  if (!conversation) {
    return (
      <aside className="border-l border-line bg-background p-5 text-xs text-ink-3">
        Nenhuma conversa selecionada.
      </aside>
    );
  }

  const name = contactDisplayName(conversation);
  const phone = conversation.contactPhone
    ? formatPhone(conversation.contactPhone)
    : conversation.contactJid;
  const since = new Date(conversation.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const totalMessages = conversation.messages.length;

  return (
    <aside className="border-l border-line bg-background p-5">
      <div className="mono mb-2.5 text-[10px] uppercase tracking-[0.08em] text-ink-3">
        Cliente
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-base font-bold tracking-[-0.01em]">{name}</div>
          <div className="text-xs text-ink-3">Desde {since}</div>
        </div>
        <Separator />
        <InfoRow label="Telefone" value={phone} />
        <InfoRow label="Status" value={statusLabel(conversation.status)} />
        <InfoRow label="Mensagens" value={String(totalMessages)} />
      </div>
    </aside>
  );
}
