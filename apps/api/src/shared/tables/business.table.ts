import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const weekendOptions = ["sim", "sabado", "nao"] as const;
export type WeekendOption = (typeof weekendOptions)[number];

export const business = pgTable(
  "business",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    category: text("category").notNull().default(""),
    phone: text("phone").notNull().default(""),
    address: text("address").notNull().default(""),
    hoursFrom: text("hours_from").notNull().default("09:00"),
    hoursTo: text("hours_to").notNull().default("18:00"),
    weekend: text("weekend").$type<WeekendOption | "">().notNull().default(""),
    description: text("description").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull()
      .defaultNow(),
  },
  (table) => [index("business_userId_idx").on(table.userId)],
);

export const businessRelations = relations(business, ({ one }) => ({
  user: one(user, {
    fields: [business.userId],
    references: [user.id],
  }),
}));
