"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConnectionBanner } from "@/components/dashboard/inbox/connection-banner";
import { ConversationList } from "@/components/dashboard/inbox/conversation-list";
import { ConversationThread } from "@/components/dashboard/inbox/conversation-thread";
import { CustomerPanel } from "@/components/dashboard/inbox/customer-panel";
import {
  type InboxConversation,
  type InboxConversationDetail,
  getInboxConversation,
  listInboxConversations,
} from "@/lib/inbox";

interface InboxShellProps {
  selectedId?: string;
}

const POLL_LIST_MS = 8000;
const POLL_DETAIL_MS = 4000;

export function InboxShell({ selectedId }: InboxShellProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<InboxConversation[] | null>(
    null,
  );
  const [detail, setDetail] = useState<InboxConversationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detailIdRef = useRef<string | undefined>(selectedId);
  detailIdRef.current = selectedId;

  const refreshList = useCallback(async () => {
    try {
      const res = await listInboxConversations();
      setConversations(res.items);
      if (!selectedId && res.items.length > 0) {
        router.replace(`/dashboard/inbox/${res.items[0]!.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao buscar conversas.");
    }
  }, [router, selectedId]);

  const refreshDetail = useCallback(async () => {
    const id = detailIdRef.current;
    if (!id) {
      setDetail(null);
      return;
    }
    try {
      const res = await getInboxConversation(id);
      if (detailIdRef.current === id) setDetail(res);
    } catch (err) {
      if (detailIdRef.current === id) {
        setError(
          err instanceof Error ? err.message : "Falha ao carregar conversa.",
        );
      }
    }
  }, []);

  useEffect(() => {
    void refreshList();
    const t = setInterval(refreshList, POLL_LIST_MS);
    return () => clearInterval(t);
  }, [refreshList]);

  useEffect(() => {
    setDetail(null);
    void refreshDetail();
    if (!selectedId) return;
    const t = setInterval(refreshDetail, POLL_DETAIL_MS);
    return () => clearInterval(t);
  }, [refreshDetail, selectedId]);

  const handleAfterSend = useCallback(() => {
    void refreshDetail();
    void refreshList();
  }, [refreshDetail, refreshList]);

  return (
    <div className="flex h-screen flex-col">
      <ConnectionBanner />
      <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr_300px]">
        <ConversationList
        items={conversations ?? []}
        loading={conversations === null}
        selectedId={selectedId}
        error={error}
      />
      {selectedId ? (
        <ConversationThread
          conversation={detail}
          loading={!detail}
          onSent={handleAfterSend}
        />
      ) : (
        <div className="flex items-center justify-center bg-surface text-sm text-ink-3">
          {conversations === null
            ? "Carregando…"
            : conversations.length === 0
              ? "Nenhuma conversa ainda."
              : "Selecione uma conversa."}
        </div>
      )}
      <CustomerPanel conversation={detail} />
      </div>
    </div>
  );
}
