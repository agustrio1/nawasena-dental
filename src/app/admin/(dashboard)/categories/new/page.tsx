import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "Kategori Baru",
  robots: { index: false, follow: false },
};

export default function AdminNewCategoryPage() {
  return <CategoryForm mode="create" />;
}
