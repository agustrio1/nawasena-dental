import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getAdminActor } from "@/lib/admin-authz";
import { getAdminUserById } from "@/lib/admin-data";
import { UserForm } from "@/components/admin/user-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Pengguna",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditUserPage({ params }: Props) {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin");

  const { id } = await params;
  const user = await getAdminUserById(id);
  if (!user) notFound();

  return <UserForm mode="edit" initial={user} isSelf={user.id === actor.id} />;
}
