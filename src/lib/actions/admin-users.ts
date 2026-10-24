"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { getAdminActor } from "@/lib/admin-authz";
import { db } from "@/db";
import { users, userRoles } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import {
  countAdminUsers,
  getAdminUserById,
  userEmailTakenByOther,
} from "@/lib/admin-data";

export type UserInput = {
  id?: string | null;
  name: string;
  email: string;
  role: string;
  password?: string | null;
};

export type SaveUserResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type ActionResult = { ok: boolean; error?: string };

const userSchema = z.object({
  id: z.string().uuid().nullish(),
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(120, "Nama maksimal 120 karakter"),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(160),
  role: z.enum(userRoles),
  password: z.string().min(8, "Password minimal 8 karakter").nullish(),
});

export async function saveUser(input: UserInput): Promise<SaveUserResult> {
  const actor = await getAdminActor();
  if (!actor) return { ok: false, error: "Tidak berwenang." };

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Mohon periksa isian formulir.", fieldErrors };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  if (await userEmailTakenByOther(email, data.id ?? null)) {
    return {
      ok: false,
      error: "Email sudah dipakai.",
      fieldErrors: { email: "Email ini sudah terdaftar." },
    };
  }

  const isEdit = Boolean(data.id);
  const password = data.password?.trim() ?? "";

  if (!isEdit && password === "") {
    return {
      ok: false,
      error: "Password wajib diisi untuk pengguna baru.",
      fieldErrors: { password: "Buat password minimal 8 karakter." },
    };
  }

  // Perlindungan kunci-diri: jangan turunkan role sendiri.
  if (isEdit && data.id === actor.id && data.role !== "admin") {
    return {
      ok: false,
      error: "Anda tidak dapat menurunkan role akun Anda sendiri.",
      fieldErrors: { role: "Tidak bisa menurunkan role sendiri." },
    };
  }

  const target = isEdit ? await getAdminUserById(data.id as string) : null;
  if (isEdit && !target) return { ok: false, error: "Pengguna tidak ditemukan." };

  // Jangan sampai tidak ada admin tersisa (edit menurunkan admin terakhir).
  if (
    isEdit &&
    target?.role === "admin" &&
    data.role !== "admin" &&
    (await countAdminUsers()) <= 1
  ) {
    return {
      ok: false,
      error: "Harus ada minimal satu admin.",
      fieldErrors: { role: "Admin terakhir tidak bisa diturunkan." },
    };
  }

  try {
    if (isEdit) {
      const patch: Record<string, unknown> = {
        name: data.name,
        email,
        role: data.role,
      };
      if (password !== "") patch.passwordHash = await hashPassword(password);
      await db.update(users).set(patch).where(eq(users.id, data.id as string));
      return { ok: true, id: data.id as string };
    }

    const [inserted] = await db
      .insert(users)
      .values({
        name: data.name,
        email,
        role: data.role,
        passwordHash: await hashPassword(password),
      })
      .returning({ id: users.id });

    return { ok: true, id: inserted.id };
  } catch {
    return { ok: false, error: "Gagal menyimpan pengguna." };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const actor = await getAdminActor();
  if (!actor) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };
  const targetId = idResult.data;

  if (targetId === actor.id) {
    return { ok: false, error: "Anda tidak dapat menghapus akun sendiri." };
  }

  const target = await getAdminUserById(targetId);
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };

  if (target.role === "admin" && (await countAdminUsers()) <= 1) {
    return { ok: false, error: "Admin terakhir tidak dapat dihapus." };
  }

  await db.delete(users).where(eq(users.id, targetId));
  return { ok: true };
}

// Aktif/nonaktifkan akun. Menonaktifkan menghentikan login & membatalkan sesi
// aktif (diperiksa di getSessionActor). Admin tidak dapat menonaktifkan dirinya.
export async function setUserActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const actor = await getAdminActor();
  if (!actor) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };
  const targetId = idResult.data;

  if (!active && targetId === actor.id) {
    return { ok: false, error: "Anda tidak dapat menonaktifkan akun sendiri." };
  }

  const target = await getAdminUserById(targetId);
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };

  await db
    .update(users)
    .set({ isActive: active })
    .where(eq(users.id, targetId));

  return { ok: true };
}
