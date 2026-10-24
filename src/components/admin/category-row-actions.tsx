"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { deleteCategory } from "@/lib/actions/admin-categories";

export function CategoryRowActions({
  id,
  articleCount,
}: {
  id: string;
  articleCount: number;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    const result = await action();
    setPending(false);
    if (result.ok) router.refresh();
    else window.alert(result.error ?? "Gagal memproses.");
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/categories/${id}/edit`}>Edit</Link>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-error hover:bg-error/5"
        onClick={() => {
          if (
            window.confirm(
              "Hapus kategori ini? Tindakan tidak bisa dibatalkan."
            )
          ) {
            void run(() => deleteCategory(id));
          }
        }}
      >
        Hapus
      </Button>

      {articleCount > 0 && (
        <span className="sr-only">
          Kategori ini masih dipakai {articleCount} artikel.
        </span>
      )}
    </div>
  );
}
