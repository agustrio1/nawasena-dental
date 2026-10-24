import "server-only";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentRequests,
  appointmentStatuses,
  articles,
  categories,
  doctors,
  faqs,
  galleryImages,
  mediaAssets,
  publishStatuses,
  services,
  siteSettings,
  type ServiceFaq,
  userRoles,
  users,
} from "@/db/schema";

export type PublishStatus = (typeof publishStatuses)[number];

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export type AdminAppointment = {
  id: string;
  name: string;
  whatsapp: string | null;
  serviceName: string | null;
  preferredDate: string;
  preferredTimeRange: string;
  note: string | null;
  status: AppointmentStatus;
  createdAt: string;
  anonymizedAt: string | null;
};

function isStatus(value: string | undefined): value is AppointmentStatus {
  return (
    typeof value === "string" &&
    (appointmentStatuses as readonly string[]).includes(value)
  );
}

// Dibaca fresh (tanpa "use cache") — rute admin sudah request-time lewat
// connection() + instant=false di layout (dashboard), jadi ini aman.
export async function listAppointments(
  statusFilter?: string
): Promise<{ items: AdminAppointment[]; filter: AppointmentStatus | "all" }> {
  const filter = isStatus(statusFilter) ? statusFilter : "all";

  const rows = await db
    .select({
      id: appointmentRequests.id,
      name: appointmentRequests.name,
      whatsapp: appointmentRequests.whatsapp,
      serviceName: services.name,
      preferredDate: appointmentRequests.preferredDate,
      preferredTimeRange: appointmentRequests.preferredTimeRange,
      note: appointmentRequests.note,
      status: appointmentRequests.status,
      createdAt: appointmentRequests.createdAt,
      anonymizedAt: appointmentRequests.anonymizedAt,
    })
    .from(appointmentRequests)
    .leftJoin(services, eq(appointmentRequests.serviceId, services.id))
    .where(filter === "all" ? undefined : eq(appointmentRequests.status, filter))
    .orderBy(desc(appointmentRequests.createdAt));

  const items: AdminAppointment[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    whatsapp: row.whatsapp,
    serviceName: row.serviceName,
    preferredDate: row.preferredDate,
    preferredTimeRange: row.preferredTimeRange,
    note: row.note,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    anonymizedAt: row.anonymizedAt ? row.anonymizedAt.toISOString() : null,
  }));

  return { items, filter };
}

export async function countAppointmentsByStatus(): Promise<
  Record<AppointmentStatus | "total", number>
> {
  const rows = await db
    .select({
      status: appointmentRequests.status,
      value: sql<number>`count(*)::int`,
    })
    .from(appointmentRequests)
    .groupBy(appointmentRequests.status);

  const counts: Record<AppointmentStatus | "total", number> = {
    baru: 0,
    dihubungi: 0,
    selesai: 0,
    total: 0,
  };

  for (const row of rows) {
    counts[row.status] = row.value;
    counts.total += row.value;
  }
  return counts;
}

/* ---------- Layanan (dibaca fresh, tanpa "use cache") ---------- */

export type AdminServiceRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  sortOrder: number;
  status: PublishStatus;
  coverPublicId: string | null;
};

export async function listAllServices(): Promise<AdminServiceRow[]> {
  return db
    .select({
      id: services.id,
      slug: services.slug,
      name: services.name,
      summary: services.summary,
      sortOrder: services.sortOrder,
      status: services.status,
      coverPublicId: mediaAssets.publicId,
    })
    .from(services)
    .leftJoin(mediaAssets, eq(services.coverMediaId, mediaAssets.id))
    .orderBy(asc(services.sortOrder), asc(services.name));
}

export type AdminServiceEdit = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  availabilityNote: string | null;
  consultReasons: string[];
  processSteps: string[];
  faqs: ServiceFaq[];
  sortOrder: number;
  status: PublishStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  cover: {
    publicId: string;
    altText: string;
    width: number;
    height: number;
  } | null;
};

export async function getAdminServiceById(
  id: string
): Promise<AdminServiceEdit | null> {
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
      sortOrder: services.sortOrder,
      status: services.status,
      seoTitle: services.seoTitle,
      seoDescription: services.seoDescription,
      coverPublicId: mediaAssets.publicId,
      coverAlt: mediaAssets.altText,
      coverWidth: mediaAssets.width,
      coverHeight: mediaAssets.height,
    })
    .from(services)
    .leftJoin(mediaAssets, eq(services.coverMediaId, mediaAssets.id))
    .where(eq(services.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    availabilityNote: row.availabilityNote,
    consultReasons: row.consultReasons,
    processSteps: row.processSteps,
    faqs: row.faqs,
    sortOrder: row.sortOrder,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    cover: row.coverPublicId
      ? {
          publicId: row.coverPublicId,
          altText: row.coverAlt ?? "",
          width: row.coverWidth ?? 1600,
          height: row.coverHeight ?? 1000,
        }
      : null,
  };
}

// Dipakai saveService untuk memeriksa slug duplikat (kecuali milik baris ini).
export async function slugTakenByOther(
  slug: string,
  excludeId?: string | null
): Promise<boolean> {
  const base = eq(services.slug, slug);
  const clause =
    excludeId && excludeId.length > 0
      ? and(base, ne(services.id, excludeId))
      : base;
  const [row] = await db
    .select({ id: services.id })
    .from(services)
    .where(clause)
    .limit(1);
  return Boolean(row);
}

/* ---------- Dokter (dibaca fresh, tanpa "use cache") ---------- */

export type AdminDoctorRow = {
  id: string;
  name: string;
  specialty: string;
  sortOrder: number;
  status: PublishStatus;
  photoPublicId: string | null;
};

export async function listAllDoctors(): Promise<AdminDoctorRow[]> {
  return db
    .select({
      id: doctors.id,
      name: doctors.name,
      specialty: doctors.specialty,
      sortOrder: doctors.sortOrder,
      status: doctors.status,
      photoPublicId: mediaAssets.publicId,
    })
    .from(doctors)
    .leftJoin(mediaAssets, eq(doctors.photoMediaId, mediaAssets.id))
    .orderBy(asc(doctors.sortOrder), asc(doctors.name));
}

export type AdminDoctorEdit = {
  id: string;
  name: string;
  specialty: string;
  education: string | null;
  experience: string | null;
  sortOrder: number;
  status: PublishStatus;
  photo: {
    publicId: string;
    altText: string;
    width: number;
    height: number;
  } | null;
};

export async function getAdminDoctorById(
  id: string
): Promise<AdminDoctorEdit | null> {
  const [row] = await db
    .select({
      id: doctors.id,
      name: doctors.name,
      specialty: doctors.specialty,
      education: doctors.education,
      experience: doctors.experience,
      sortOrder: doctors.sortOrder,
      status: doctors.status,
      photoPublicId: mediaAssets.publicId,
      photoAlt: mediaAssets.altText,
      photoWidth: mediaAssets.width,
      photoHeight: mediaAssets.height,
    })
    .from(doctors)
    .leftJoin(mediaAssets, eq(doctors.photoMediaId, mediaAssets.id))
    .where(eq(doctors.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    education: row.education,
    experience: row.experience,
    sortOrder: row.sortOrder,
    status: row.status,
    photo: row.photoPublicId
      ? {
          publicId: row.photoPublicId,
          altText: row.photoAlt ?? "",
          width: row.photoWidth ?? 1000,
          height: row.photoHeight ?? 1000,
        }
      : null,
  };
}

/* ---------- Kategori & Artikel (dibaca fresh, tanpa "use cache") ---------- */

export type AdminCategoryOption = { id: string; name: string; slug: string };

export async function listCategories(): Promise<AdminCategoryOption[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(asc(categories.name));
}

/* ---------- Kategori (kelola; dibaca fresh, tanpa "use cache") ---------- */

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
};

export async function listAllCategories(): Promise<AdminCategoryRow[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      articleCount: sql<number>`count(${articles.id})::int`,
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id, categories.name, categories.slug)
    .orderBy(asc(categories.name));

  return rows.map((r) => ({ ...r, articleCount: Number(r.articleCount) }));
}

export type AdminCategoryEdit = {
  id: string;
  name: string;
  slug: string;
};

export async function getAdminCategoryById(
  id: string
): Promise<AdminCategoryEdit | null> {
  const [row] = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return row ?? null;
}

export async function categorySlugTakenByOther(
  slug: string,
  excludeId?: string | null
): Promise<boolean> {
  const base = eq(categories.slug, slug);
  const clause =
    excludeId && excludeId.length > 0
      ? and(base, ne(categories.id, excludeId))
      : base;
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(clause)
    .limit(1);
  return Boolean(row);
}

// Jumlah artikel yang memakai kategori ini (untuk blokir hapus).
export async function countArticlesInCategory(id: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.categoryId, id))
    .limit(1);
  return Number(row?.count ?? 0);
}

export type AdminArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: PublishStatus;
  publishedAt: string | null;
  categoryName: string;
  isProfessionallyReviewed: boolean;
};

export async function listAllArticles(): Promise<AdminArticleRow[]> {
  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      status: articles.status,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      isProfessionallyReviewed: articles.isProfessionallyReviewed,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.createdAt));

  return rows.map((row) => ({
    ...row,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
  }));
}

export type AdminArticleEdit = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  status: PublishStatus;
  publishedAt: string | null;
  isProfessionallyReviewed: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  schemaJson: Record<string, unknown> | null;
  cover: {
    publicId: string;
    altText: string;
    width: number;
    height: number;
  } | null;
};

export async function getAdminArticleById(
  id: string
): Promise<AdminArticleEdit | null> {
  const [row] = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      content: articles.content,
      categoryId: articles.categoryId,
      status: articles.status,
      publishedAt: articles.publishedAt,
      isProfessionallyReviewed: articles.isProfessionallyReviewed,
      seoTitle: articles.seoTitle,
      seoDescription: articles.seoDescription,
      schemaJson: articles.schemaJson,
      coverPublicId: mediaAssets.publicId,
      coverAlt: mediaAssets.altText,
      coverWidth: mediaAssets.width,
      coverHeight: mediaAssets.height,
    })
    .from(articles)
    .leftJoin(mediaAssets, eq(articles.coverMediaId, mediaAssets.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    categoryId: row.categoryId,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    isProfessionallyReviewed: row.isProfessionallyReviewed,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    schemaJson: row.schemaJson,
    cover: row.coverPublicId
      ? {
          publicId: row.coverPublicId,
          altText: row.coverAlt ?? "",
          width: row.coverWidth ?? 1600,
          height: row.coverHeight ?? 1000,
        }
      : null,
  };
}

export async function articleSlugTakenByOther(
  slug: string,
  excludeId?: string | null
): Promise<boolean> {
  const base = eq(articles.slug, slug);
  const clause =
    excludeId && excludeId.length > 0
      ? and(base, ne(articles.id, excludeId))
      : base;
  const [row] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(clause)
    .limit(1);
  return Boolean(row);
}

/* ---------- Pengaturan situs (dibaca fresh, tanpa "use cache") ---------- */

export type AdminSiteSettings = {
  clinicName: string;
  addressText: string;
  hoursText: string;
  whatsappNumber: string;
  faviconPublicId: string | null;
  logoPublicId: string | null;
  heroImagePublicId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[] | null;
  ogImagePublicId: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  metaPixelId: string | null;
  googleSiteVerification: string | null;
  bingVerification: string | null;
  facebookDomainVerification: string | null;
  mapsQuery: string | null;
  updatedAt: string | null;
};

export async function getAdminSiteSettings(): Promise<AdminSiteSettings> {
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
      updatedAt: siteSettings.updatedAt,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  return {
    clinicName: row?.clinicName ?? "Nawasena Dental Care",
    addressText: row?.addressText ?? "",
    hoursText: row?.hoursText ?? "",
    whatsappNumber: row?.whatsappNumber ?? "",
    faviconPublicId: row?.faviconPublicId ?? null,
    logoPublicId: row?.logoPublicId ?? null,
    heroImagePublicId: row?.heroImagePublicId ?? null,
    seoTitle: row?.seoTitle ?? null,
    seoDescription: row?.seoDescription ?? null,
    seoKeywords: row?.seoKeywords ?? null,
    ogImagePublicId: row?.ogImagePublicId ?? null,
    instagramUrl: row?.instagramUrl ?? null,
    facebookUrl: row?.facebookUrl ?? null,
    tiktokUrl: row?.tiktokUrl ?? null,
    youtubeUrl: row?.youtubeUrl ?? null,
    googleAnalyticsId: row?.googleAnalyticsId ?? null,
    googleTagManagerId: row?.googleTagManagerId ?? null,
    metaPixelId: row?.metaPixelId ?? null,
    googleSiteVerification: row?.googleSiteVerification ?? null,
    bingVerification: row?.bingVerification ?? null,
    facebookDomainVerification: row?.facebookDomainVerification ?? null,
    mapsQuery: row?.mapsQuery ?? null,
    updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

/* ---------- Galeri (dibaca fresh, tanpa "use cache") ---------- */

export type AdminGalleryRow = {
  id: string;
  caption: string | null;
  publicId: string;
  isActive: boolean;
  sortOrder: number;
};

export async function listAllGallery(): Promise<AdminGalleryRow[]> {
  return db
    .select({
      id: galleryImages.id,
      caption: galleryImages.caption,
      publicId: mediaAssets.publicId,
      isActive: galleryImages.isActive,
      sortOrder: galleryImages.sortOrder,
    })
    .from(galleryImages)
    .innerJoin(mediaAssets, eq(galleryImages.mediaId, mediaAssets.id))
    .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt));
}

export type AdminGalleryEdit = {
  id: string;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
  image: {
    publicId: string;
    altText: string;
    width: number;
    height: number;
  } | null;
};

export async function getAdminGalleryById(
  id: string
): Promise<AdminGalleryEdit | null> {
  const [row] = await db
    .select({
      id: galleryImages.id,
      caption: galleryImages.caption,
      sortOrder: galleryImages.sortOrder,
      isActive: galleryImages.isActive,
      publicId: mediaAssets.publicId,
      altText: mediaAssets.altText,
      width: mediaAssets.width,
      height: mediaAssets.height,
    })
    .from(galleryImages)
    .leftJoin(mediaAssets, eq(galleryImages.mediaId, mediaAssets.id))
    .where(eq(galleryImages.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    caption: row.caption,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    image: row.publicId
      ? {
          publicId: row.publicId,
          altText: row.altText ?? "",
          width: row.width ?? 1600,
          height: row.height ?? 1000,
        }
      : null,
  };
}

/* ---------- FAQ situs (dibaca fresh, tanpa "use cache") ---------- */

export type AdminFaqRow = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

export async function listAllFaqs(): Promise<AdminFaqRow[]> {
  return db
    .select({
      id: faqs.id,
      question: faqs.question,
      answer: faqs.answer,
      isActive: faqs.isActive,
      sortOrder: faqs.sortOrder,
    })
    .from(faqs)
    .orderBy(asc(faqs.sortOrder), desc(faqs.createdAt));
}

export type AdminFaqEdit = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

export async function getAdminFaqById(
  id: string
): Promise<AdminFaqEdit | null> {
  const [row] = await db
    .select({
      id: faqs.id,
      question: faqs.question,
      answer: faqs.answer,
      isActive: faqs.isActive,
      sortOrder: faqs.sortOrder,
    })
    .from(faqs)
    .where(eq(faqs.id, id))
    .limit(1);

  return row ?? null;
}

/* ---------- Pengguna (khusus admin; dibaca fresh, tanpa "use cache") ---------- */

export type UserRole = (typeof userRoles)[number];

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export async function listAllUsers(): Promise<AdminUserRow[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  return rows.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : String(r.createdAt ?? ""),
  }));
}

export type AdminUserEdit = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
};

export async function getAdminUserById(id: string): Promise<AdminUserEdit | null> {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return row ?? null;
}

export async function userEmailTakenByOther(
  email: string,
  excludeId?: string | null
): Promise<boolean> {
  const base = eq(users.email, email);
  const clause =
    excludeId && excludeId.length > 0
      ? and(base, ne(users.id, excludeId))
      : base;
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(clause)
    .limit(1);
  return Boolean(row);
}

export async function countAdminUsers(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);
  return Number(row?.count ?? 0);
}

/* ---------- Pustaka media (B7) ---------- */

export type MediaLibraryRow = {
  id: string;
  publicId: string;
  altText: string;
  width: number;
  height: number;
  credit: string | null;
  createdAt: string;
};

// Daftar aset yang pernah disimpan lewat form (media_assets), terbaru di atas.
export async function listMediaAssets(): Promise<MediaLibraryRow[]> {
  const rows = await db
    .select({
      id: mediaAssets.id,
      publicId: mediaAssets.publicId,
      altText: mediaAssets.altText,
      width: mediaAssets.width,
      height: mediaAssets.height,
      credit: mediaAssets.credit,
      createdAt: mediaAssets.createdAt,
    })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt));

  return rows.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : String(r.createdAt ?? ""),
  }));
}



