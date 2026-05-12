import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { conversation } from "./conversation.table";

export const messageRoles = ["customer", "assistant", "agent", "system"] as const;
export type MessageRole = (typeof messageRoles)[number];

export const messageStatuses = ["sent", "failed", "received"] as const;
export type MessageStatus = (typeof messageStatuses)[number];

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    role: text("role").$type<MessageRole>().notNull(),
    content: text("content").notNull().default(""),
    evolutionMessageId: text("evolution_message_id"),
    status: text("status").$type<MessageStatus>().notNull().default("sent"),
    error: text("error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("message_conversationId_idx").on(table.conversationId),
    uniqueIndex("message_evolutionId_uniq").on(table.evolutionMessageId),
  ],
);

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));
