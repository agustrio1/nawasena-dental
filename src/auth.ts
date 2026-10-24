import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";

// next-auth v4 — Credentials provider, sesi JWT (httpOnly cookie).
// Akun admin disimpan di tabel `users` dengan passwordHash (scrypt).
// Catatan: karena memakai Credentials, sesi WAJIB jwt (bukan database).
// Tabel adapter (accounts/sessions/verification_tokens) sudah tersedia di
// schema untuk dipakai nanti bila menambah provider OAuth (DrizzleAdapter).
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Kredensial",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            passwordHash: users.passwordHash,
            isActive: users.isActive,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;
        // Akun dinonaktifkan tidak boleh masuk.
        if (!user.isActive) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
