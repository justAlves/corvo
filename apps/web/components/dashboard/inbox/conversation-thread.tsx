"use client";

import { useEffect, useRef } from "react";

import { ChatBubble, SystemMessage } from "@/components/dashboard/inbox/chat-bubble";
import { MessageComposer } from "@/components/dashboard/inbox/message-composer";
import { Button } from "@/components/ui/button";
import {
  type InboxConversationDetail,
  colorForJid,
  contactDisplayName,
  formatPhone,
  sendInboxMessage,
  setConversationStatus,
} from "@/lib/inbox";

interface ConversationThreadProps {
  conversation: InboxConversationDetail | null;
  loading: boolean;
  onSent: () => void;
}

export function ConversationThread({
  conversation,
  loading,
  onSent,
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation?.messages.length]);

  if (loading || !conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-surface text-sm text-ink-3">
        Carregando conversa…
      </div>
    );
  }

  const name = contactDisplayName(conversation);
  const phone = conversation.contactPhone
    ? formatPhone(conversation.contactPhone)
    : conversation.contactJid;

  async function handleSend(_id: string, text: string) {
    await sendInboxMessage(conversation!.id, text);
    onSent();
  }

  async function toggleHandover() {
    const next = conversation!.status === "human" ? "ai" : "human";
    await setConversationStatus(conversation!.id, next);
    onSent();
  }

  async function handleClose() {
    await setConversationStatus(conversation!.id, "closed");
    onSent();
  }

  const isClosed = conversation.status === "closed";

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <header className="flex items-center gap-2.5 border-b border-line bg-background px-5 py-3.5">
        <span
          className="size-9 shrink-0 rounded-full"
          style={{ background: colorForJid(conversation.contactJid) }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-ink-3">{phone}</div>
        </div>
        {!isClosed && (
          <>
            <Button variant="outline" size="sm" onClick={toggleHandover}>
              {conversation.status === "human" ? "Devolver pra IA" : "Assumir conversa"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Encerrar
            </Button>
          </>
        )}
        {isClosed && (
          <span className="mono rounded-full border border-line px-2.5 py-0.5 text-[10px] uppercase tracking-[0.04em] text-ink-3">
            Encerrada
          </span>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-6"
      >
        {conversation.messages.length === 0 ? (
          <div className="self-center text-xs text-ink-3">
            Nenhuma mensagem ainda.
          </div>
        ) : (
          conversation.messages.map((m) => {
            if (m.role === "system") {
              return <SystemMessage key={m.id}>{m.content}</SystemMessage>;
            }
            return (
              <ChatBubble
                key={m.id}
                role={m.role}
                failed={m.status === "failed"}
              >
                {m.content}
              </ChatBubble>
            );
          })
        )}
      </div>

      <MessageComposer conversationId={conversation.id} onSend={handleSend} />
    </div>
  );
}
