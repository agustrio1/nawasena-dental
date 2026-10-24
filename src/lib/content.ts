import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import {
  articles,
  categories,
  doctors,
  faqs,
  galleryImages,
  mediaAssets,
  services,
  siteSettings,
} from "@/db/schema";

/* ---------- View model (tetap sama, sehingga komponen tidak perlu berubah) ---------- */

export type Faq = { question: string; answer: string };

export type ServiceContent = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  availabilityNote: string | null;
  consultReasons: string[];
  processSteps: string[];
  faqs: Faq[];
  coverPublicId: string | null;
  coverAlt: string | null;
};

export type DoctorContent = {
  name: string;
  specialty: string;
  education: string | null;
  experience: string | null;
  photoPublicId: string | null;
  photoAlt: string | null;
};

export type ArticleContent = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string; // ISO date
  isProfessionallyReviewed: boolean;
  coverPublicId: string | null;
  coverAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  schemaJson: Record<string, unknown> | null;
};

export type SiteSettingsContent = {
  clinicName: string;
  addressText: string;
  hoursText: string;
  whatsappNumber: string;
  // Branding
  faviconPublicId: string | null;
  logoPublicId: string | null;
  heroImagePublicId: string | null;
  // SEO default
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[] | null;
  ogImagePublicId: string | null;
  // Sosial media
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  // Analitik
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  metaPixelId: string | null;
  // Verifikasi
  googleSiteVerification: string | null;
  bingVerification: string | null;
  facebookDomainVerification: string | null;
  mapsQuery: string | null;
};

export type GalleryContent = {
  caption: string | null;
  publicId: string;
  alt: string;
};

/* ---------- Query baca (di-cache; cacheComponents aktif) ----------
   Tahap 6: data berasal dari Neon. Isi diganti dari data demo Tahap 5.
   Invalidate seluruh konten dengan revalidateTag("content").
--------------------------------------------------------------- */

export async function getServices(): Promise<ServiceContent[]> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  return db
    .select({
      id: services.id,
      slug: services.slug,
      name: services.name,
      summary: services.summary,
      description: services.description,
      availabilityNote: services.availabilityNote,
      consultReasons: services.consultReasons,
      processSteps: services.processSteps,
      faqs: services.faqs,
      coverPublicId: mediaAssets.publicId,
      coverAlt: mediaAssets.altText,
    })
    .from(services)
    .leftJoin(mediaAssets, eq(services.coverMediaId, mediaAssets.id))
    .where(eq(services.status, "published"))
    .orderBy(asc(services.sortOrder));
}

export async function getServiceBySlug(
  slug: string
): Promise<ServiceContent | null> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  const [row] = await db
    .select({
      id: services.id,
      slug: services.slug,
      name: services.name,
      summary: services.summary,
      description: services.description,
      availabilityNote: services.availabilityNote,
      consultReasons: services.consultReasons,
      processSteps: services.processSteps,
      faqs: services.faqs,
      coverPublicId: mediaAssets.publicId,
      coverAlt: mediaAssets.altText,
    })
    .from(services)
    .leftJoin(mediaAssets, eq(services.coverMediaId, mediaAssets.id))
    .where(sql`${services.status} = 'published' and ${services.slug} = ${slug}`)
    .limit(1);

  return row ?? null;
}

export async function getDoctors(): Promise<DoctorContent[]> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  return db
    .select({
      name: doctors.name,
      specialty: doctors.specialty,
      education: doctors.education,
      experience: doctors.experience,
      photoPublicId: mediaAssets.publicId,
      photoAlt: mediaAssets.altText,
    })
    .from(doctors)
    .leftJoin(mediaAssets, eq(doctors.photoMediaId, mediaAssets.id))
    .where(eq(doctors.status, "published"))
    .orderBy(asc(doctors.sortOrder));
}

export async function getArticles(): Promise<ArticleContent[]> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  const rows = await db
    .select({
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      content: articles.content,
      category: categories.name,
      publishedAt: articles.publishedAt,
      isProfessionallyReviewed: articles.isProfessionallyReviewed,
      coverPublicId: mediaAssets.publicId,
      coverAlt: mediaAssets.altText,
      seoTitle: articles.seoTitle,
      seoDescription: articles.seoDescription,
      schemaJson: articles.schemaJson,
    })
    .from(articles)
    .leftJoin(mediaAssets, eq(articles.coverMediaId, mediaAssets.id))
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt));

  return rows.map((row) => ({
    ...row,
    publishedAt: (row.publishedAt ?? new Date(0)).toISOString(),
  }));
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleContent | null> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  const rows = await db
    .select({
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      content: articles.content,
      category: categories.name,
      publishedAt: articles.publishedAt,
      isProfessionallyReviewed: articles.isProfessionallyReviewed,
      coverPublicId: mediaAssets.publicId,
      coverAlt: mediaAssets.altText,
      seoTitle: articles.seoTitle,
      seoDescription: articles.seoDescription,
      schemaJson: articles.schemaJson,
    })
    .from(articles)
    .leftJoin(mediaAssets, eq(articles.coverMediaId, mediaAssets.id))
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(sql`${articles.status} = 'published' and ${articles.slug} = ${slug}`)
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    publishedAt: (row.publishedAt ?? new Date(0)).toISOString(),
  };
}

export async function getSiteSettings(): Promise<SiteSettingsContent> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  const [row] = await db
    .select({
      clinicName: siteSettings.clinicName,
      addressText: siteSettings.addressText,
      hoursText: siteSettings.hoursText,
      whatsappNumber: siteSettings.whatsappNumber,
      faviconPublicId: siteSettings.faviconPublicId,
      logoPublicId: siteSettings.logoPublicId,
      heroImagePublicId: siteSettings.heroImagePublicId,
      seoTitle: siteSettings.seoTitle,
      seoDescription: siteSettings.seoDescription,
      seoKeywords: siteSettings.seoKeywords,
      ogImagePublicId: siteSettings.ogImagePublicId,
      instagramUrl: siteSettings.instagramUrl,
      facebookUrl: siteSettings.facebookUrl,
      tiktokUrl: siteSettings.tiktokUrl,
      youtubeUrl: siteSettings.youtubeUrl,
      googleAnalyticsId: siteSettings.googleAnalyticsId,
      googleTagManagerId: siteSettings.googleTagManagerId,
      metaPixelId: siteSettings.metaPixelId,
      googleSiteVerification: siteSettings.googleSiteVerification,
      bingVerification: siteSettings.bingVerification,
      facebookDomainVerification: siteSettings.facebookDomainVerification,
      mapsQuery: siteSettings.mapsQuery,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  // Fallback agar halaman tidak crash bila baris site_settings belum di-seed.
  return (
    row ?? {
      clinicName: "Nawasena Dental Care",
      addressText: "Alamat demo — silakan jalankan db:seed.",
      hoursText: "Senin - Jumat: 08.00 - 20.00",
      whatsappNumber: "",
      faviconPublicId: null,
      logoPublicId: null,
      heroImagePublicId: null,
      seoTitle: null,
      seoDescription: null,
      seoKeywords: null,
      ogImagePublicId: null,
      instagramUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
      youtubeUrl: null,
      googleAnalyticsId: null,
      googleTagManagerId: null,
      metaPixelId: null,
      googleSiteVerification: null,
      bingVerification: null,
      facebookDomainVerification: null,
      mapsQuery: null,
    }
  );
}

export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  const rows = await db
    .select({ question: faqs.question, answer: faqs.answer })
    .from(faqs)
    .where(eq(faqs.isActive, true))
    .orderBy(asc(faqs.sortOrder));

  return rows;
}

export async function getGallery(): Promise<GalleryContent[]> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("content");

  return db
    .select({
      caption: galleryImages.caption,
      publicId: mediaAssets.publicId,
      alt: mediaAssets.altText,
    })
    .from(galleryImages)
    .innerJoin(mediaAssets, eq(galleryImages.mediaId, mediaAssets.id))
    .where(eq(galleryImages.isActive, true))
    .orderBy(asc(galleryImages.sortOrder));
}
