import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminDoctorById } from "@/lib/admin-data";
import { DoctorForm } from "@/components/admin/doctor-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Dokter",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditDoctorPage({ params }: Props) {
  const { id } = await params;
  const doctor = await getAdminDoctorById(id);

  if (!doctor) notFound();

  return <DoctorForm mode="edit" initial={doctor} />;
}
