"use server";

import { updateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/db";
import { articles, categories, publishStatuses } from "@/db/schema";
import { articleSlugTakenByOther } from "@/lib/admin-data";
import { upsertMediaAsset, type CoverInput } from "@/lib/media-admin";

export type ArticleInput = {
  id?: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  status: string;
  publishedAt?: string | null;
  isProfessionallyReviewed: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  schemaJson?: Record<string, unknown> | null;
  cover: CoverInput;
};

export type SaveArticleResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type ActionResult = { ok: boolean; error?: string };

async function assertAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// HTML boleh berisi tag kosong; cukup pastikan ada teks nyata.
function hasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() !== "";
}

const articleSchema = z.object({
  id: z.string().uuid().nullish(),
  title: z.string().trim().min(1, "Judul wajib diisi").max(160),
  slug: z.string().trim().max(180),
  excerpt: z
    .string()
    .trim()
    .min(1, "Ringkasan wajib diisi")
    .max(300, "Ringkasan maksimal 300 karakter"),
  content: z.string().refine(hasText, "Konten artikel belum diisi"),
  categoryId: z.string().uuid("Pilih kategori"),
  status: z.enum(publishStatuses),
  publishedAt: z.string().nullish(),
  isProfessionallyReviewed: z.boolean(),
  seoTitle: z.string().trim().max(120).nullish(),
  seoDescription: z.string().trim().max(200).nullish(),
  schemaJson: z.record(z.string(), z.unknown()).nullish(),
  cover: z
    .object({
      publicId: z.string().trim(),
      altText: z.string().trim(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    })
    .nullable(),
});

export async function saveArticle(
  input: ArticleInput
): Promise<SaveArticleResult> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Tidak berwenang." };
  }

  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Mohon periksa isian formulir.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const finalSlug = data.slug !== "" ? slugify(data.slug) : slugify(data.title);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
    return {
      ok: false,
      error: "Slug tidak valid.",
      fieldErrors: {
        slug: "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
      },
    };
  }

  if (await articleSlugTakenByOther(finalSlug, data.id ?? null)) {
    return {
      ok: false,
      error: "Slug sudah dipakai artikel lain.",
      fieldErrors: { slug: "Slug ini sudah digunakan." },
    };
  }

  // Pastikan kategori benar-benar ada (FK).
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, data.categoryId))
    .limit(1);
  if (!category) {
    return {
      ok: false,
      error: "Kategori tidak valid.",
      fieldErrors: { categoryId: "Pilih kategori yang tersedia." },
    };
  }

  const coverMediaId = await upsertMediaAsset(data.cover);

  // publishedAt: pakai nilai form bila ada; untuk status terbit tanpa tanggal,
  // isi otomatis agar lolos check articles_published_at_check.
  let publishedAt: Date | null = data.publishedAt
    ? new Date(data.publishedAt)
    : null;
  if (data.status === "published" && !publishedAt) {
    publishedAt = new Date();
  }

  const values = {
    slug: finalSlug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    categoryId: data.categoryId,
    status: data.status,
    publishedAt,
    isProfessionallyReviewed: data.isProfessionallyReviewed,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    schemaJson: data.schemaJson ?? null,
    coverMediaId,
  };

  try {
    if (data.id) {
      await db
        .update(articles)
        .set(values)
        .where(eq(articles.id, data.id));
      updateTag("content");
      return { ok: true, id: data.id };
    }

    const [inserted] = await db
      .insert(articles)
      .values(values)
      .returning({ id: articles.id });

    updateTag("content");
    return { ok: true, id: inserted.id };
  } catch {
    return {
      ok: false,
      error: "Gagal menyimpan artikel. Periksa slug dan kategori.",
      fieldErrors: { slug: "Slug mungkin sudah digunakan." },
    };
  }
}

const statusSchema = z.enum(publishStatuses);

export async function setArticleStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  const statusResult = statusSchema.safeParse(status);
  if (!idResult.success || !statusResult.success) {
    return { ok: false, error: "Data tidak valid." };
  }

  const [existing] = await db
    .select({ publishedAt: articles.publishedAt })
    .from(articles)
    .where(eq(articles.id, idResult.data))
    .limit(1);

  const patch: {
    status: (typeof publishStatuses)[number];
    publishedAt?: Date;
  } = { status: statusResult.data };
  // Terbit wajib punya tanggal; pakai yang ada atau isi sekarang.
  if (statusResult.data === "published" && !existing?.publishedAt) {
    patch.publishedAt = new Date();
  }

  await db
    .update(articles)
    .set(patch)
    .where(eq(articles.id, idResult.data));

  updateTag("content");
  return { ok: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  await db.delete(articles).where(eq(articles.id, idResult.data));

  updateTag("content");
  return { ok: true };
}
