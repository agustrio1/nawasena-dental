"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionActor } from "@/lib/admin-authz";
import { hashPassword, verifyPassword } from "@/lib/password";

export type ActionResult = { ok: boolean; error?: string };

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(120, "Nama maksimal 120 karakter"),
  // publicId Cloudinary untuk avatar; null/kosong berarti tanpa avatar.
  image: z.string().trim().max(300).nullish(),
});

// Ubah profil milik sendiri (nama + avatar). Role & email tidak diubah di sini.
export async function saveOwnProfile(input: {
  name: string;
  image?: string | null;
}): Promise<ActionResult> {
  const actor = await getSessionActor();
  if (!actor) return { ok: false, error: "Sesi tidak valid." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  await db
    .update(users)
    .set({ name: parsed.data.name, image: parsed.data.image || null })
    .where(eq(users.id, actor.id));

  return { ok: true };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  })
  // Cegah password baru sama persis dengan lama (opsional, UX).
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "Password baru harus berbeda dari password saat ini.",
    path: ["newPassword"],
  });

export async function changeOwnPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const actor = await getSessionActor();
  if (!actor) return { ok: false, error: "Sesi tidak valid." };

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, actor.id))
    .limit(1);

  if (!row?.passwordHash) {
    return { ok: false, error: "Akun ini tidak memakai password." };
  }

  const ok = await verifyPassword(parsed.data.currentPassword, row.passwordHash);
  if (!ok) {
    return { ok: false, error: "Password saat ini salah." };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword) })
    .where(eq(users.id, actor.id));

  return { ok: true };
}
