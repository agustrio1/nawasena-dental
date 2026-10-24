import type { Metadata } from "next";

import { listCategories } from "@/lib/admin-data";
import { ArticleForm } from "@/components/admin/article-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Artikel Baru",
  robots: { index: false, follow: false },
};

export default async function AdminNewArticlePage() {
  const categories = await listCategories();
  return <ArticleForm mode="create" categories={categories} />;
}
