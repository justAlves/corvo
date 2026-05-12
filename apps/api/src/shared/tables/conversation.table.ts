import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./user.table";
import { whatsappInstance } from "./whatsapp-instance.table";

export const conversationStatuses = [
  "ai",
  "human",
  "waiting",
  "closed",
] as const;
export type ConversationStatus = (typeof conversationStatuses)[number];

export const conversation = pgTable(
  "conversation",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    instanceId: text("instance_id")
      .notNull()
      .references(() => whatsappInstance.id, { onDelete: "cascade" }),
    contactJid: text("contact_jid").notNull(),
    contactPhone: text("contact_phone"),
    contactName: text("contact_name"),
    contactAvatarUrl: text("contact_avatar_url"),
    status: text("status")
      .$type<ConversationStatus>()
      .notNull()
      .default("ai"),
    lastMessagePreview: text("last_message_preview").notNull().default(""),
    lastMessageAt: timestamp("last_message_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("conversation_userId_idx").on(table.userId),
    index("conversation_lastMessageAt_idx").on(table.lastMessageAt),
    uniqueIndex("conversation_instance_jid_uniq").on(
      table.instanceId,
      table.contactJid,
    ),
  ],
);

export const conversationRelations = relations(conversation, ({ one }) => ({
  user: one(user, {
    fields: [conversation.userId],
    references: [user.id],
  }),
  instance: one(whatsappInstance, {
    fields: [conversation.instanceId],
    references: [whatsappInstance.id],
  }),
}));
