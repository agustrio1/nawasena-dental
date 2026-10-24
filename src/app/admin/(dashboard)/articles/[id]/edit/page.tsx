import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminArticleById, listCategories } from "@/lib/admin-data";
import { ArticleForm } from "@/components/admin/article-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Artikel",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditArticlePage({ params }: Props) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    getAdminArticleById(id),
    listCategories(),
  ]);

  if (!article) notFound();

  return <ArticleForm mode="edit" initial={article} categories={categories} />;
}
