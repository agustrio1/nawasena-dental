"use server";

import { updateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import {
  categorySlugTakenByOther,
  countArticlesInCategory,
} from "@/lib/admin-data";

export type CategoryInput = {
  id?: string | null;
  name: string;
  slug: string;
};

export type SaveCategoryResult =
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

const categorySchema = z.object({
  id: z.string().uuid().nullish(),
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(80, "Nama kategori maksimal 80 karakter"),
  slug: z.string().trim().max(80),
});

export async function saveCategory(
  input: CategoryInput
): Promise<SaveCategoryResult> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Tidak berwenang." };
  }

  const parsed = categorySchema.safeParse(input);
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
  const finalSlug =
    data.slug.trim() !== "" ? slugify(data.slug) : slugify(data.name);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
    return {
      ok: false,
      error: "Slug tidak valid.",
      fieldErrors: {
        slug: "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
      },
    };
  }

  if (await categorySlugTakenByOther(finalSlug, data.id ?? null)) {
    return {
      ok: false,
      error: "Slug sudah dipakai kategori lain.",
      fieldErrors: { slug: "Slug ini sudah digunakan." },
    };
  }

  // Nama juga unik (unique constraint di DB) → cek lebih dulu untuk pesan ramah.
  const nameBase = eq(categories.name, data.name);
  const nameClause = data.id
    ? and(nameBase, ne(categories.id, data.id))
    : nameBase;
  const [nameTaken] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(nameClause)
    .limit(1);
  if (nameTaken) {
    return {
      ok: false,
      error: "Nama kategori sudah ada.",
      fieldErrors: { name: "Nama ini sudah dipakai kategori lain." },
    };
  }

  const values = { name: data.name, slug: finalSlug };

  try {
    if (data.id) {
      await db
        .update(categories)
        .set(values)
        .where(eq(categories.id, data.id));
      updateTag("content");
      return { ok: true, id: data.id };
    }

    const [inserted] = await db
      .insert(categories)
      .values(values)
      .returning({ id: categories.id });

    updateTag("content");
    return { ok: true, id: inserted.id };
  } catch {
    return {
      ok: false,
      error: "Gagal menyimpan kategori.",
      fieldErrors: { slug: "Slug atau nama mungkin sudah digunakan." },
    };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  // articles.category_id memakai FK RESTRICT → blokir bila masih terpakai.
  const used = await countArticlesInCategory(idResult.data);
  if (used > 0) {
    return {
      ok: false,
      error: `Tidak bisa dihapus: masih dipakai ${used} artikel. Pindahkan artikel ke kategori lain terlebih dahulu.`,
    };
  }

  await db.delete(categories).where(eq(categories.id, idResult.data));

  updateTag("content");
  return { ok: true };
}
