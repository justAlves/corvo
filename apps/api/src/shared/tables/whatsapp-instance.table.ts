import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./user.table";

export const whatsappInstanceStatus = [
  "pending",
  "connecting",
  "connected",
  "disconnected",
] as const;

export type WhatsappInstanceStatus = (typeof whatsappInstanceStatus)[number];

export const whatsappInstance = pgTable(
  "whatsapp_instance",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    instanceName: text("instance_name").notNull().unique(),
    evolutionInstanceId: text("evolution_instance_id"),
    apiKey: text("api_key").notNull(),
    status: text("status").$type<WhatsappInstanceStatus>().notNull().default("pending"),
    qrCode: text("qr_code"),
    pairingCode: text("pairing_code"),
    phoneNumber: text("phone_number"),
    profileName: text("profile_name"),
    profilePictureUrl: text("profile_picture_url"),
    lastConnectedAt: timestamp("last_connected_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull()
      .defaultNow(),
  },
  (table) => [index("whatsapp_instance_userId_idx").on(table.userId)],
);

export const whatsappInstanceRelations = relations(whatsappInstance, ({ one }) => ({
  user: one(user, {
    fields: [whatsappInstance.userId],
    references: [user.id],
  }),
}));
