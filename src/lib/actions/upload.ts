"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { uploadImage, type UploadResult } from "@/lib/cloudinary-admin";

export type UploadActionResult =
  | ({ ok: true } & UploadResult)
  | { ok: false; error: string };

// Dipakai komponen uploader (cover/profil) dan rich text editor (gambar inline).
export async function uploadImageAction(
  formData: FormData
): Promise<UploadActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Tidak berwenang." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Tidak ada file yang dikirim." };
  }

  try {
    const result = await uploadImage(file);
    return { ok: true, ...result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload gagal.",
    };
  }
}
