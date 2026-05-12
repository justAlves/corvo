import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const assistantTones = [
  "descolada",
  "amigavel",
  "profissional",
  "divertida",
] as const;
export type AssistantTone = (typeof assistantTones)[number];

export type AssistantPermissions = {
  scheduling: boolean;
  payments: boolean;
  handoff: boolean;
  discounts: boolean;
};

export const DEFAULT_ASSISTANT_PERMISSIONS: AssistantPermissions = {
  scheduling: true,
  payments: true,
  handoff: true,
  discounts: false,
};

export const assistant = pgTable(
  "assistant",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Lia"),
    tone: text("tone").$type<AssistantTone>().notNull().default("descolada"),
    avatar: integer("avatar").notNull().default(0),
    greeting: text("greeting")
      .notNull()
      .default("Oi! Sou a Lia, posso te ajudar?"),
    permissions: jsonb("permissions")
      .$type<AssistantPermissions>()
      .notNull()
      .default(DEFAULT_ASSISTANT_PERMISSIONS),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull()
      .defaultNow(),
  },
  (table) => [index("assistant_userId_idx").on(table.userId)],
);

export const assistantRelations = relations(assistant, ({ one }) => ({
  user: one(user, {
    fields: [assistant.userId],
    references: [user.id],
  }),
}));
