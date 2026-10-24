import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionActor } from "@/lib/admin-authz";
import { ProfileForm } from "@/components/admin/profile-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Profil Saya",
  robots: { index: false, follow: false },
};

export default async function AdminProfilePage() {
  const actor = await getSessionActor();
  if (!actor) redirect("/admin/login");

  const [row] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, actor.id))
    .limit(1);

  return (
    <ProfileForm
      initialName={row?.name ?? actor.name ?? ""}
      email={actor.email}
      role={actor.role}
      initialImage={row?.image ?? null}
    />
  );
}
