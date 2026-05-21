import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const subscriptionStatuses = [
  "trial",
  "active",
  "cancel_at_period_end",
  "cancelled",
  "expired",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status")
      .$type<SubscriptionStatus>()
      .notNull()
      .default("trial"),
    abacateCustomerId: text("abacate_customer_id"),
    abacateSubscriptionId: text("abacate_subscription_id"),
    trialEndsAt: timestamp("trial_ends_at"),
    currentPeriodEndsAt: timestamp("current_period_ends_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull()
      .defaultNow(),
  },
  (table) => [index("subscription_userId_idx").on(table.userId)],
);

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}));
