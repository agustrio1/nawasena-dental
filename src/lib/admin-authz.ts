import "server-only";

import { getServerSession } from "next-auth";
import { connection } from "next/server";
import { eq } from "drizzle-orm";

import { authOptions } from "@/auth";
import { db } from "@/db";
import { users, userRoles } from "@/db/schema";

type UserRole = (typeof userRoles)[number];

export type Actor = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
};

// Role TIDAK tersimpan di JWT (authorize hanya mengembalikan id/email/name),
// jadi selalu dibaca ulang dari DB agar perubahan role langsung berlaku.
export async function getSessionActor(): Promise<Actor | null> {
  // Sengaja request-time: `getServerSession` memakai nilai tidak stabil
  // (randomBytes/CSRF/new Date) yang memicu "Blocking Route" saat prerender.
  await connection();
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  const [me] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Akun dihapus atau baru dinonaktifkan -> sesi dianggap tidak valid,
  // sehingga pengguna langsung keluar walau JWT-nya masih ada.
  if (!me || !me.isActive) return null;
  return me;
}

// Hanya boleh bila peran admin (dipakai halaman & action Kelola Pengguna).
export async function getAdminActor(): Promise<Actor | null> {
  const actor = await getSessionActor();
  return actor && actor.role === "admin" ? actor : null;
}
