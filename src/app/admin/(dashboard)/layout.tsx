import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminShell } from "@/components/admin/admin-shell";
import type { SearchItem } from "@/components/admin/admin-command";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { getSessionActor } from "@/lib/admin-authz";
import { listAllArticles, listAllServices } from "@/lib/admin-data";

// Rute admin bersifat request-time (session + data DB). Izinkan blocking
// daripada menampilkan placeholder Suspense untuk area terproteksi.
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Lapis perlindungan kedua (middleware adalah lapis pertama).
  // Sengaja request-time: hindari prerender getServerSession (randomBytes/CSRF).
  await connection();
  const actor = await getSessionActor();
  if (!actor) redirect("/admin/login");
  const isAdmin = actor.role === "admin";

  const [services, articles] = await Promise.all([
    listAllServices(),
    listAllArticles(),
  ]);

  // Sumber command palette: menu admin + konten. Tautan konten menunjuk ke
  // halaman edit admin (butuh id), dibaca fresh (bukan cache publik).
  // Menu khusus admin disembunyikan bagi peran editor.
  const searchItems: SearchItem[] = [
    ...ADMIN_NAV.filter((n) => !n.requiresAdmin || isAdmin).map((n) => ({
      group: "Menu",
      title: n.label,
      href: n.href,
    })),
    ...services.map((s) => ({
      group: "Layanan",
      title: s.name,
      href: `/admin/services/${s.id}/edit`,
    })),
    ...articles.map((a) => ({
      group: "Artikel",
      title: a.title,
      href: `/admin/articles/${a.id}/edit`,
    })),
  ];

  return (
    <AdminShell searchItems={searchItems} isAdmin={isAdmin}>
      {children}
    </AdminShell>
  );
}
