"use client";

import * as React from "react";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { MediaPicker } from "@/components/admin/media-picker";
import { cloudinaryPreviewUrl } from "@/lib/cloudinary-client";
import { uploadImageAction } from "@/lib/actions/upload";

export type ImageValue = {
  publicId: string;
  altText: string;
  width: number;
  height: number;
};

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export function ImageUploadField({
  label = "Gambar",
  value,
  onChange,
}: {
  label?: string;
  value: ImageValue | null;
  onChange: (next: ImageValue | null) => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [libraryOpen, setLibraryOpen] = React.useState(false);

  async function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format tidak didukung. Gunakan JPG, PNG, WebP, AVIF, atau GIF.");
      return;
    }

    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImageAction(fd);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange({
      publicId: result.publicId,
      altText: value?.altText ?? "",
      width: result.width,
      height: result.height,
    });
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (pending) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function onDragOver(event: React.DragEvent) {
    event.preventDefault();
    if (!pending) setDragging(true);
  }

  const preview = value?.publicId
    ? cloudinaryPreviewUrl(value.publicId, 800)
    : "";

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <header className="mb-4 space-y-0.5">
        <h2 className="text-sm font-semibold tracking-wide text-forest">
          {label}
        </h2>
        <p className="text-xs text-charcoal/55">
          JPG, PNG, WebP, AVIF, atau GIF.
        </p>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="space-y-4">
        {preview ? (
          <div className="space-y-3">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={() => setDragging(false)}
              className={`relative aspect-video w-full overflow-hidden rounded-xl border bg-ivory/50 transition-colors ${
                dragging ? "border-forest ring-2 ring-forest/30" : "border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={value?.altText || "Pratinjau gambar"}
                className="h-full w-full object-cover"
              />
              {(pending || dragging) && (
                <div className="absolute inset-0 flex items-center justify-center bg-forest/60 text-sm font-medium text-white backdrop-blur-[2px]">
                  {pending ? "Mengunggah..." : "Lepas untuk mengganti"}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs tabular-nums text-charcoal/55">
                {value?.width} × {value?.height} px
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => fileRef.current?.click()}
                >
                  {pending ? "Mengunggah..." : "Ganti"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => setLibraryOpen(true)}
                >
                  Pustaka
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  className="text-error hover:bg-error/5"
                  onClick={() => onChange(null)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => fileRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={() => setDragging(false)}
              className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                dragging
                  ? "border-forest bg-sage/50"
                  : "border-line bg-ivory/50 hover:border-forest/50 hover:bg-sage/30"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-forest/70"
              >
                <path d="M12 16V4m0 0L8 8m4-4 4 4" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              <span className="text-sm font-medium text-forest">
                {pending
                  ? "Mengunggah..."
                  : dragging
                    ? "Lepas untuk mengunggah"
                    : "Tarik gambar ke sini"}
              </span>
              {!pending && (
                <span className="text-xs text-charcoal/55">
                  atau klik untuk memilih file
                </span>
              )}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-forest"
              onClick={() => setLibraryOpen(true)}
            >
              Pilih dari pustaka
            </Button>
          </div>
        )}

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-charcoal/70">
            Alt text (deskripsi untuk aksesibilitas)
          </span>
          <Input
            value={value?.altText ?? ""}
            onChange={(e) =>
              value && onChange({ ...value, altText: e.target.value })
            }
            disabled={!value}
            placeholder={
              value ? "mis. Ruang pemeriksaan gigi" : "Unggah gambar dulu"
            }
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>

      <MediaPicker
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={(next) => onChange(next)}
      />
    </section>
  );
}