import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets } from "@/db/schema";

export type CoverInput = {
  publicId: string;
  altText: string;
  width?: number;
  height?: number;
} | null;

// Upsert baris media_assets berdasarkan publicId; kembalikan id (atau null).
// Dipakai form Layanan (cover) dan Dokter (photo).
export async function upsertMediaAsset(
  cover: CoverInput
): Promise<string | null> {
  if (!cover || cover.publicId === "") return null;
  const width = cover.width ?? 1600;
  const height = cover.height ?? 1000;

  const [existing] = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.publicId, cover.publicId))
    .limit(1);

  if (existing) {
    await db
      .update(mediaAssets)
      .set({ altText: cover.altText, width, height })
      .where(eq(mediaAssets.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db
    .insert(mediaAssets)
    .values({
      publicId: cover.publicId,
      altText: cover.altText,
      width,
      height,
    })
    .returning({ id: mediaAssets.id });

  return inserted?.id ?? null;
}
