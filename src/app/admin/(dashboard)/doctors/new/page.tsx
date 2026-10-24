import type { Metadata } from "next";

import { DoctorForm } from "@/components/admin/doctor-form";

export const metadata: Metadata = {
  title: "Dokter Baru",
  robots: { index: false, follow: false },
};

export default function AdminNewDoctorPage() {
  return <DoctorForm mode="create" />;
}
