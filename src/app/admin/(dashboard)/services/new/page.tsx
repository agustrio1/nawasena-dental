import type { Metadata } from "next";

import { ServiceForm } from "@/components/admin/service-form";

export const metadata: Metadata = {
  title: "Layanan Baru",
  robots: { index: false, follow: false },
};

export default function AdminNewServicePage() {
  return <ServiceForm mode="create" />;
}
