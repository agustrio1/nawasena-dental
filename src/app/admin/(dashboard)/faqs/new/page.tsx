import type { Metadata } from "next";

import { FaqForm } from "@/components/admin/faq-form";

export const metadata: Metadata = {
  title: "FAQ Baru",
  robots: { index: false, follow: false },
};

export default function AdminNewFaqPage() {
  return <FaqForm mode="create" />;
}
