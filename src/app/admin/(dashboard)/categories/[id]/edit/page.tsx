import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminCategoryById } from "@/lib/admin-data";
import { CategoryForm } from "@/components/admin/category-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Kategori",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) notFound();

  return <CategoryForm mode="edit" initial={category} />;
}
