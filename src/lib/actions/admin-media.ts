"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getAdminActor, getSessionActor } from "@/lib/admin-authz";
import { listMediaAssets, type MediaLibraryRow } from "@/lib/admin-data";
import { destroyImage } from "@/lib/cloudinary-admin";

export type ActionResult = { ok: boolean; error?: string };

// Sumber data pemilih pustaka di ImageUploadField — boleh semua yang login.
export async function getMediaAssetsAction(): Promise<MediaLibraryRow[]> {
  const actor = await getSessionActor();
  if (!actor) return [];
  return listMediaAssets();
}

// Hapus aset: hanya admin. Menghapus baris DB dan aset Cloudinary.
// Catatan FK: cover pada layanan/artikel/dokter menjadi kosong (set null);
// gambar galeri yang merujuk aset ini ikut terhapus (cascade).
export async function deleteMediaAssetAction(
  id: string
): Promise<ActionResult> {
  const actor = await getAdminActor();
  if (!actor) return { ok: false, error: "Hanya admin yang dapat menghapus media." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  const [row] = await db
    .select({ publicId: mediaAssets.publicId })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, idResult.data))
    .limit(1);

  if (!row) return { ok: false, error: "Aset tidak ditemukan." };

  try {
    await destroyImage(row.publicId);
  } catch {
    // Aset Cloudinary mungkin sudah tidak ada; tetap lanjut hapus baris DB.
  }

  await db.delete(mediaAssets).where(eq(mediaAssets.id, idResult.data));
  return { ok: true };
}
