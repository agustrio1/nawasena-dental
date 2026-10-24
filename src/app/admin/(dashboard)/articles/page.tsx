import type { Metadata } from "next";
import Link from "next/link";

import { listAllArticles } from "@/lib/admin-data";
import { ArticleRowActions } from "@/components/admin/article-row-actions";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export const instant = false;

export const metadata: Metadata = {
  title: "Artikel",
  robots: { index: false, follow: false },
};

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-1.5 h-4 w-4"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Stat({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-charcoal/60">
        <span className={cn("h-2 w-2 rounded-full", dotClass)} />
        {label}
      </div>
      <p className="mt-1 font-serif text-2xl tabular-nums text-forest">
        {value}
      </p>
    </div>
  );
}

export default async function AdminArticlesPage() {
  const items = await listAllArticles();

  const publishedCount = items.filter((i) => i.status === "published").length;
  const draftCount = items.length - publishedCount;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-charcoal/50">
            Konten
          </p>
          <h1 className="font-serif text-2xl text-forest sm:text-3xl">
            Artikel
          </h1>
          <p className="mt-1 text-sm text-charcoal/65">
            Konten edukatif pada halaman /artikel.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <PlusIcon />
            Artikel Baru
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total" value={items.length} dotClass="bg-charcoal/40" />
        <Stat label="Terbit" value={publishedCount} dotClass="bg-forest" />
        <Stat label="Draf" value={draftCount} dotClass="bg-charcoal/25" />
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl border-line shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/50 text-forest">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5M9 13h6M9 17h6" />
              </svg>
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-forest">
                Belum ada artikel
              </p>
              <p className="text-sm text-charcoal/60">
                Mulai dengan menulis artikel edukatif pertama Anda.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/articles/new">
                <PlusIcon />
                Artikel Baru
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-line shadow-sm">
          <CardContent className="divide-y divide-line p-0">
            {items.map((item) => {
              const isPublished = item.status === "published";
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-ivory/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <h2 className="min-w-0 max-w-full truncate text-base font-medium text-forest">
                        {item.title}
                      </h2>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          isPublished
                            ? "bg-forest text-ivory"
                            : "bg-sage text-forest"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isPublished ? "bg-ivory" : "bg-forest/50"
                          )}
                        />
                        {isPublished ? "Terbit" : "Draf"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/65">
                      <span className="rounded-md bg-ivory px-2 py-0.5 font-medium text-charcoal/75">
                        {item.categoryName}
                      </span>
                      <span>
                        {item.publishedAt
                          ? formatDate(item.publishedAt)
                          : "Belum terbit"}
                      </span>
                      {item.isProfessionallyReviewed && (
                        <span className="inline-flex items-center gap-1 text-forest">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Ditinjau
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <ArticleRowActions id={item.id} status={item.status} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}