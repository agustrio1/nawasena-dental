import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminActor } from "@/lib/admin-authz";
import { getAdminSiteSettings } from "@/lib/admin-data";

export const instant = false;

export const metadata: Metadata = {
  title: "Pengaturan",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  // Pengaturan khusus admin (matriks hak akses).
  const actor = await getAdminActor();
  if (!actor) redirect("/admin");

  const settings = await getAdminSiteSettings();

  return <SettingsForm initial={settings} />;
}
