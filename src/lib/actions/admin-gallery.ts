"use server";

import { updateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/db";
import { galleryImages } from "@/db/schema";
import { upsertMediaAsset, type CoverInput } from "@/lib/media-admin";

export type GalleryInput = {
  id?: string | null;
  caption?: string | null;
  sortOrder: number;
  isActive: boolean;
  image: CoverInput;
};

export type SaveGalleryResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type ActionResult = { ok: boolean; error?: string };

async function assertAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

const gallerySchema = z.object({
  id: z.string().uuid().nullish(),
  caption: z.string().trim().max(200).nullish(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  image: z
    .object({
      publicId: z.string().trim().min(1, "Gambar wajib diunggah"),
      altText: z.string().trim(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    })
    .nullable(),
});

export async function saveGallery(
  input: GalleryInput
): Promise<SaveGalleryResult> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Tidak berwenang." };
  }

  const parsed = gallerySchema.safeParse(input);
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
  if (!data.image || data.image.publicId === "") {
    return {
      ok: false,
      error: "Gambar wajib diunggah.",
      fieldErrors: { image: "Unggah satu gambar untuk galeri." },
    };
  }

  const mediaId = await upsertMediaAsset(data.image);
  if (!mediaId) {
    return { ok: false, error: "Gagal menyimpan referensi gambar." };
  }

  const values = {
    caption: data.caption || null,
    mediaId,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
  };

  try {
    if (data.id) {
      await db
        .update(galleryImages)
        .set(values)
        .where(eq(galleryImages.id, data.id));
      updateTag("content");
      return { ok: true, id: data.id };
    }

    const [inserted] = await db
      .insert(galleryImages)
      .values(values)
      .returning({ id: galleryImages.id });

    updateTag("content");
    return { ok: true, id: inserted.id };
  } catch {
    return { ok: false, error: "Gagal menyimpan gambar galeri." };
  }
}

export async function setGalleryActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  await db
    .update(galleryImages)
    .set({ isActive })
    .where(eq(galleryImages.id, idResult.data));

  updateTag("content");
  return { ok: true };
}

export async function deleteGallery(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  await db.delete(galleryImages).where(eq(galleryImages.id, idResult.data));

  updateTag("content");
  return { ok: true };
}
