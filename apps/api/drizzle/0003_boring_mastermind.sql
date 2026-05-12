CREATE TABLE "assistant" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'Lia' NOT NULL,
	"tone" text DEFAULT 'descolada' NOT NULL,
	"avatar" integer DEFAULT 0 NOT NULL,
	"greeting" text DEFAULT 'Oi! Sou a Lia, posso te ajudar?' NOT NULL,
	"permissions" jsonb DEFAULT '{"scheduling":true,"payments":true,"handoff":true,"discounts":false}'::jsonb NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assistant_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "business" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"hours_from" text DEFAULT '09:00' NOT NULL,
	"hours_to" text DEFAULT '18:00' NOT NULL,
	"weekend" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "assistant" ADD CONSTRAINT "assistant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assistant_userId_idx" ON "assistant" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "business_userId_idx" ON "business" USING btree ("user_id");