import type { Metadata } from "next";
import Link from "next/link";

import { listAllCategories } from "@/lib/admin-data";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";

export const instant = false;

export const metadata: Metadata = {
  title: "Kategori",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const items = await listAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-forest">Kategori</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            {items.length} kategori · dipakai untuk mengelompokkan artikel.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">Kategori Baru</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-charcoal/60">
            Belum ada kategori. Klik &ldquo;Kategori Baru&rdquo; untuk membuat
            yang pertama.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-line p-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-h3 text-forest">{item.name}</h2>
                  <p className="mt-1 truncate font-mono text-xs text-charcoal/50">
                    /{item.slug}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden text-xs text-charcoal/45 sm:inline">
                    {item.articleCount} artikel
                  </span>
                  <CategoryRowActions
                    id={item.id}
                    articleCount={item.articleCount}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
