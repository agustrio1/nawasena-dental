import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminFaqById } from "@/lib/admin-data";
import { FaqForm } from "@/components/admin/faq-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit FAQ",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditFaqPage({ params }: Props) {
  const { id } = await params;
  const faq = await getAdminFaqById(id);

  if (!faq) notFound();

  return <FaqForm mode="edit" initial={faq} />;
}
