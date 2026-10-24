import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminServiceById } from "@/lib/admin-data";
import { ServiceForm } from "@/components/admin/service-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Layanan",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditServicePage({ params }: Props) {
  const { id } = await params;
  const service = await getAdminServiceById(id);

  if (!service) notFound();

  return <ServiceForm mode="edit" initial={service} />;
}
