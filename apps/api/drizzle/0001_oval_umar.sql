CREATE TABLE "whatsapp_instance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instance_name" text NOT NULL,
	"evolution_instance_id" text,
	"api_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"phone_number" text,
	"profile_name" text,
	"profile_picture_url" text,
	"last_connected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_instance_instance_name_unique" UNIQUE("instance_name")
);
--> statement-breakpoint
ALTER TABLE "whatsapp_instance" ADD CONSTRAINT "whatsapp_instance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "whatsapp_instance_userId_idx" ON "whatsapp_instance" USING btree ("user_id");