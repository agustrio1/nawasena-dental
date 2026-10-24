"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import {
  deleteArticle,
  setArticleStatus,
} from "@/lib/actions/admin-articles";

export function ArticleRowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if (result.ok) {
      setConfirming(false);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal memproses.");
    }
  }

  const published = status === "published";

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {confirming ? (
          <>
            <span className="text-xs text-charcoal/65">
              Hapus artikel ini? Tidak bisa dibatalkan.
            </span>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              className="bg-error text-white hover:bg-error/90"
              onClick={() => void run(() => deleteArticle(id))}
            >
              {pending ? "Menghapus..." : "Ya, hapus"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Batal
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/articles/${id}/edit`}>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5 h-3.5 w-3.5"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
                Edit
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                void run(() =>
                  setArticleStatus(id, published ? "draft" : "published")
                )
              }
            >
              {pending ? "Memproses..." : published ? "Jadi draf" : "Terbitkan"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              className="text-error hover:bg-error/5"
              onClick={() => {
                setError(null);
                setConfirming(true);
              }}
            >
              Hapus
            </Button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}