CREATE TABLE "appointment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"service_id" uuid,
	"preferred_date" date NOT NULL,
	"preferred_time_range" text NOT NULL,
	"note" text,
	"consent_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'baru' NOT NULL,
	"anonymized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointment_requests_name_check" CHECK (char_length("appointment_requests"."name") between 1 and 100),
	CONSTRAINT "appointment_requests_whatsapp_check" CHECK ("appointment_requests"."whatsapp" ~ '^[0-9]{8,15}$' or "appointment_requests"."anonymized_at" is not null),
	CONSTRAINT "appointment_requests_note_check" CHECK (char_length("appointment_requests"."note") <= 300),
	CONSTRAINT "appointment_requests_status_check" CHECK ("appointment_requests"."status" in ('baru', 'dihubungi', 'selesai')),
	CONSTRAINT "appointment_requests_time_range_check" CHECK ("appointment_requests"."preferred_time_range" in ('pagi', 'siang', 'sore'))
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"cover_media_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"is_professionally_reviewed" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "articles_status_check" CHECK ("articles"."status" in ('draft', 'published')),
	CONSTRAINT "articles_category_check" CHECK ("articles"."category" in ('Kebersihan gigi', 'Perawatan', 'Ortodonti', 'Keluarga')),
	CONSTRAINT "articles_published_at_check" CHECK ("articles"."status" <> 'published' or "articles"."published_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"specialty" text NOT NULL,
	"education" text,
	"experience" text,
	"photo_media_id" uuid,
	"sort_order" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "doctors_status_check" CHECK ("doctors"."status" in ('draft', 'published'))
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"alt_text" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"credit" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"availability_note" text,
	"consult_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"process_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover_media_id" uuid,
	"sort_order" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug"),
	CONSTRAINT "services_status_check" CHECK ("services"."status" in ('draft', 'published'))
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"clinic_name" text NOT NULL,
	"address_text" text NOT NULL,
	"hours_text" text NOT NULL,
	"whatsapp_number" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_single_row" CHECK ("site_settings"."id" = 1),
	CONSTRAINT "site_settings_whatsapp_check" CHECK ("site_settings"."whatsapp_number" ~ '^[0-9]{8,15}$')
);
--> statement-breakpoint
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_photo_media_id_media_assets_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointment_requests_status_created_idx" ON "appointment_requests" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "appointment_requests_whatsapp_created_idx" ON "appointment_requests" USING btree ("whatsapp","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "articles_status_published_idx" ON "articles" USING btree ("status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "doctors_status_sort_idx" ON "doctors" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "services_status_sort_idx" ON "services" USING btree ("status","sort_order");