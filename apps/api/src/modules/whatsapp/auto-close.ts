import { and, lt, ne, sql } from "drizzle-orm";

import { drizzle } from "../../config/db";
import { conversation } from "../../shared/tables/conversation.table";

const HOURS = Number(process.env.AUTO_CLOSE_HOURS ?? "24");
const INTERVAL_MS = 60 * 60 * 1000; // run every hour

export async function autoCloseStaleConversations() {
  const cutoff = new Date(Date.now() - HOURS * 60 * 60 * 1000);

  const closed = await drizzle
    .update(conversation)
    .set({ status: "closed", updatedAt: new Date() })
    .where(
      and(
        ne(conversation.status, "closed"),
        lt(conversation.lastMessageAt, cutoff),
      ),
    )
    .returning({ id: conversation.id });

  if (closed.length > 0) {
    console.log(
      `[auto-close] fechou ${closed.length} conversa(s) inativa(s) há mais de ${HOURS}h`,
    );
  }
}

export function startAutoCloseJob() {
  void autoCloseStaleConversations();
  setInterval(() => void autoCloseStaleConversations(), INTERVAL_MS);
}
