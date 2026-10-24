"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteMediaAssetAction } from "@/lib/actions/admin-media";
import { cloudinaryPreviewUrl } from "@/lib/cloudinary-client";
import type { MediaLibraryRow } from "@/lib/admin-data";

export function MediaLibrary({
  items,
  canDelete,
}: {
  items: MediaLibraryRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function remove(item: MediaLibraryRow) {
    const ok = window.confirm(
      `Hapus gambar ini dari pustaka?\n\n${item.altText || item.publicId}\n\n` +
        "Aset Cloudinary ikut dihapus. Cover layanan/artikel/dokter yang memakainya akan menjadi kosong, dan gambar galeri yang merujuknya ikut terhapus."
    );
    if (!ok) return;

    setPendingId(item.id);
    setError(null);
    const result = await deleteMediaAssetAction(item.id);
    setPendingId(null);
    if (!result.ok) {
      setError(result.error ?? "Gagal menghapus.");
      return;
    }
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-white px-4 py-10 text-center text-sm text-charcoal/60">
        Pustaka masih kosong. Gambar yang tersimpan lewat form Layanan, Dokter,
        Artikel, atau Galeri akan muncul di sini.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-line bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryPreviewUrl(item.publicId, 400)}
              alt={item.altText || "Gambar pustaka"}
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
            <div className="space-y-1 px-3 py-2">
              <p className="truncate text-xs text-charcoal/75" title={item.altText}>
                {item.altText || item.publicId}
              </p>
              <p className="text-[11px] tabular-nums text-charcoal/45">
                {item.width} × {item.height} px
              </p>
              {canDelete && (
                <button
                  type="button"
                  disabled={pendingId === item.id}
                  onClick={() => void remove(item)}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-error/40 px-2 py-1 text-xs text-error transition-colors hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {pendingId === item.id ? "Menghapus…" : "Hapus"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
