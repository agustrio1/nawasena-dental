import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminActor } from "@/lib/admin-authz";
import { UserForm } from "@/components/admin/user-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Pengguna Baru",
  robots: { index: false, follow: false },
};

export default async function AdminNewUserPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin");

  return <UserForm mode="create" />;
}
