import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/* ---------- Helper ---------- */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    // Hanya berlaku lewat Drizzle, bukan trigger database
    .$onUpdate(() => new Date()),
};

export const publishStatuses = ["draft", "published"] as const;
export const appointmentStatuses = ["baru", "dihubungi", "selesai"] as const;
export const timeRanges = ["pagi", "siang", "sore"] as const;
export const userRoles = ["admin", "editor"] as const;

/* ---------- Auth.js adapter tables (@auth/drizzle-adapter) ----------
   Kontrak kolom memakai property camelCase yang diharapkan adapter.
   CATATAN: karena login memakai Credentials provider, sesi tetap JWT.
   Tabel sessions/accounts hanya benar-benar terpakai bila nanti menambah
   provider OAuth (mis. Google). */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  // Hash scrypt (salt:hex). Bukan plaintext. Nullable untuk pengguna OAuth.
  passwordHash: text("password_hash"),
  role: text("role", { enum: userRoles })
    .notNull()
    .default("admin"),
  // Akun nonaktif tidak dapat masuk (diperiksa saat login & saat baca sesi).
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    id_token: text("id_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    created_at: text("created_at"),
    updated_at: text("updated_at"),
  },
  (t) => [unique("accounts_provider_idx").on(t.provider, t.providerAccountId)]
);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [unique("verification_tokens_idx").on(t.identifier, t.token)]
);

/* ---------- categories ---------- */

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    ...timestamps,
  },
  (t) => [index("categories_slug_idx").on(t.slug)]
);

/* ---------- media_assets ---------- */

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: text("public_id").notNull().unique(),
  altText: text("alt_text").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  credit: text("credit"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ---------- services ---------- */

export type ServiceFaq = { question: string; answer: string };

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    availabilityNote: text("availability_note"),
    consultReasons: jsonb("consult_reasons")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    processSteps: jsonb("process_steps")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    faqs: jsonb("faqs")
      .$type<ServiceFaq[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull(),
    status: text("status", { enum: publishStatuses })
      .notNull()
      .default("draft"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ...timestamps,
  },
  (t) => [
    index("services_status_sort_idx").on(t.status, t.sortOrder),
    check("services_status_check", sql`${t.status} in ('draft', 'published')`),
  ]
);

/* ---------- doctors ---------- */

export const doctors = pgTable(
  "doctors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    specialty: text("specialty").notNull(),
    education: text("education"),
    experience: text("experience"),
    photoMediaId: uuid("photo_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull(),
    status: text("status", { enum: publishStatuses })
      .notNull()
      .default("draft"),
    ...timestamps,
  },
  (t) => [
    index("doctors_status_sort_idx").on(t.status, t.sortOrder),
    check("doctors_status_check", sql`${t.status} in ('draft', 'published')`),
  ]
);

/* ---------- articles ---------- */

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    // HTML dari rich text editor (Tiptap StarterKit)
    content: text("content").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    status: text("status", { enum: publishStatuses })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    isProfessionallyReviewed: boolean("is_professionally_reviewed")
      .notNull()
      .default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    // JSON-LD (structured data) siap-pakai; null = pakai fallback otomatis.
    schemaJson: jsonb("schema_json").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("articles_status_published_idx").on(t.status, t.publishedAt.desc()),
    index("articles_category_idx").on(t.categoryId),
    check("articles_status_check", sql`${t.status} in ('draft', 'published')`),
    check(
      "articles_published_at_check",
      sql`${t.status} <> 'published' or ${t.publishedAt} is not null`
    ),
  ]
);

/* ---------- faqs (FAQ global homepage, §5A.8) ---------- */

export const faqs = pgTable(
  "faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("faqs_active_sort_idx").on(t.isActive, t.sortOrder)]
);

/* ---------- gallery_images (Pengalaman klinik, §5A.7) ---------- */

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caption: text("caption"),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("gallery_active_sort_idx").on(t.isActive, t.sortOrder)]
);

/* ---------- appointment_requests ---------- */

export const appointmentRequests = pgTable(
  "appointment_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Digit saja, format internasional tanpa "+", mis. 6281234567890.
    // Nullable: di-null-kan saat baris dianonimkan (lihat whatsapp_check).
    whatsapp: text("whatsapp"),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    preferredDate: date("preferred_date", { mode: "string" }).notNull(),
    preferredTimeRange: text("preferred_time_range", {
      enum: timeRanges,
    }).notNull(),
    note: text("note"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    status: text("status", { enum: appointmentStatuses })
      .notNull()
      .default("baru"),
    anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("appointment_requests_status_created_idx").on(
      t.status,
      t.createdAt.desc()
    ),
    // Untuk pembatasan frekuensi per nomor WhatsApp
    index("appointment_requests_whatsapp_created_idx").on(
      t.whatsapp,
      t.createdAt.desc()
    ),
    check(
      "appointment_requests_name_check",
      sql`char_length(${t.name}) between 1 and 100`
    ),
    check(
      "appointment_requests_whatsapp_check",
      sql`${t.whatsapp} ~ '^[0-9]{8,15}$' or ${t.anonymizedAt} is not null`
    ),
    check(
      "appointment_requests_note_check",
      sql`char_length(${t.note}) <= 300`
    ),
    check(
      "appointment_requests_status_check",
      sql`${t.status} in ('baru', 'dihubungi', 'selesai')`
    ),
    check(
      "appointment_requests_time_range_check",
      sql`${t.preferredTimeRange} in ('pagi', 'siang', 'sore')`
    ),
  ]
);

/* ---------- site_settings (satu baris) ---------- */

export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    clinicName: text("clinic_name").notNull(),
    addressText: text("address_text").notNull(),
    hoursText: text("hours_text").notNull(),
    // Digit saja, format internasional tanpa "+"
    whatsappNumber: text("whatsapp_number").notNull(),
    // ---- Branding (disimpan publicId Cloudinary, bukan URL penuh) ----
    faviconPublicId: text("favicon_public_id"),
    logoPublicId: text("logo_public_id"),
    // Gambar banner/hero halaman home (opsional; fallback ke foto galeri pertama).
    heroImagePublicId: text("hero_image_public_id"),
    // ---- SEO default (nilai ini tetap dapat dioverride per-halaman) ----
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoKeywords: jsonb("seo_keywords").$type<string[]>(),
    ogImagePublicId: text("og_image_public_id"),
    // ---- Sosial media (URL publik, tervalidasi http/https di action) ----
    instagramUrl: text("instagram_url"),
    facebookUrl: text("facebook_url"),
    tiktokUrl: text("tiktok_url"),
    youtubeUrl: text("youtube_url"),
    // ---- Analitik (ID yang memang publik, BUKAN secret/API key) ----
    googleAnalyticsId: text("google_analytics_id"),
    googleTagManagerId: text("google_tag_manager_id"),
    metaPixelId: text("meta_pixel_id"),
    // ---- Verifikasi mesin pencari/jaringan (meta tag memang publik) ----
    googleSiteVerification: text("google_site_verification"),
    bingVerification: text("bing_verification"),
    facebookDomainVerification: text("facebook_domain_verification"),
    // ---- Peta: kueri/alamat untuk Google Maps embed (tanpa API key).
    // Disimpan sebagai teks; URL embed dibangun server-side dengan encodeURIComponent.
    mapsQuery: text("maps_query"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check("site_settings_single_row", sql`${t.id} = 1`),
    check(
      "site_settings_whatsapp_check",
      sql`${t.whatsappNumber} ~ '^[0-9]{8,15}$'`
    ),
  ]
);

/* ---------- Tipe turunan ---------- */

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type AppointmentRequest = typeof appointmentRequests.$inferSelect;
export type NewAppointmentRequest = typeof appointmentRequests.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type User = typeof users.$inferSelect;
