import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const knowledgeKinds = ["url", "file", "text"] as const;
export type KnowledgeKind = (typeof knowledgeKinds)[number];

export const knowledge = pgTable(
  "knowledge",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind").$type<KnowledgeKind>().notNull(),
    title: text("title").notNull().default(""),
    sourceUrl: text("source_url"),
    mimeType: text("mime_type"),
    content: text("content").notNull().default(""),
    sizeBytes: integer("size_bytes").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull()
      .defaultNow(),
  },
  (table) => [index("knowledge_userId_idx").on(table.userId)],
);

export const knowledgeRelations = relations(knowledge, ({ one }) => ({
  user: one(user, {
    fields: [knowledge.userId],
    references: [user.id],
  }),
}));
