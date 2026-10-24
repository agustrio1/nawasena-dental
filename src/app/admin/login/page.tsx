import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { authOptions } from "@/auth";
import { Card, CardContent } from "@/components/admin/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

// Halaman login perlu akses session (connection/getServerSession) yang bersifat
// request-time. Kita izinkan route ini blocking (tanpa Suspense placeholder):
// menampilkan form login palsu lalu redirect justru UX yang buruk.
export const instant = false;

export default async function AdminLoginPage() {
  // Halaman login bersifat request-time. Menandai dynamic di titik ini agar
  // cacheComponents tidak mencoba mem-prerender getServerSession (yang memakai
  // randomBytes untuk CSRF) dan memicu "Blocking Route ... unstable value".
  await connection();

  const session = await getServerSession(authOptions);
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-forest font-semibold text-ivory">
            N
          </div>
          <h1 className="mt-4 font-serif text-2xl text-forest">Admin Nawasena</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            Panel pengelolaan konten (situs demo).
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
