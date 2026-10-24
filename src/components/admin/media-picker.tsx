"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { getMediaAssetsAction } from "@/lib/actions/admin-media";
import { cloudinaryPreviewUrl } from "@/lib/cloudinary-client";
import type { ImageValue } from "@/components/admin/image-upload-field";

type MediaOption = {
  id: string;
  publicId: string;
  altText: string;
  width: number;
  height: number;
};

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: ImageValue) => void;
}) {
  const [items, setItems] = React.useState<MediaOption[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || items !== null || error) return;
    let active = true;
    getMediaAssetsAction()
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch(() => {
        if (active) setError("Gagal memuat pustaka media.");
      });
    return () => {
      active = false;
    };
  }, [open, items, error]);

  function choose(item: MediaOption) {
    onSelect({
      publicId: item.publicId,
      altText: item.altText,
      width: item.width,
      height: item.height,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">Pilih dari pustaka media</DialogTitle>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-forest">
            Pustaka media
          </h2>
          <span className="text-xs text-charcoal/50">
            {items ? `${items.length} aset` : "Memuat…"}
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {error ? (
            <p className="py-8 text-center text-sm text-error">{error}</p>
          ) : items === null ? (
            <p className="py-8 text-center text-sm text-charcoal/55">
              Memuat pustaka…
            </p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-charcoal/55">
              Pustaka masih kosong. Gambar yang tersimpan lewat form akan muncul
              di sini.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(item)}
                  className="group overflow-hidden rounded-xl border border-line bg-white text-left transition-colors hover:border-forest"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cloudinaryPreviewUrl(item.publicId, 320)}
                    alt={item.altText || "Gambar pustaka"}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                  <span className="block px-2 py-1.5">
                    <span className="block truncate text-xs text-charcoal/75">
                      {item.altText || item.publicId}
                    </span>
                    <span className="block text-[11px] tabular-nums text-charcoal/45">
                      {item.width} × {item.height}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
