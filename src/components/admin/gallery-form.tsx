"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import {
  ImageUploadField,
  type ImageValue,
} from "@/components/admin/image-upload-field";
import {
  saveGallery,
  type GalleryInput,
} from "@/lib/actions/admin-gallery";
import type { AdminGalleryEdit } from "@/lib/admin-data";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-forest">{label}</span>
      {hint && <span className="block text-xs text-charcoal/55">{hint}</span>}
      {children}
      {error && <span className="block text-xs text-error">{error}</span>}
    </label>
  );
}

export function GalleryForm({
  initial,
  mode,
}: {
  initial?: AdminGalleryEdit;
  mode: "create" | "edit";
}) {
  const router = useRouter();

  const [caption, setCaption] = React.useState(initial?.caption ?? "");
  const [sortOrder, setSortOrder] = React.useState(
    String(initial?.sortOrder ?? 0)
  );
  const [isActive, setIsActive] = React.useState(initial?.isActive ?? true);
  const [image, setImage] = React.useState<ImageValue | null>(
    initial?.image
      ? {
          publicId: initial.image.publicId,
          altText: initial.image.altText,
          width: initial.image.width,
          height: initial.image.height,
        }
      : null
  );

  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const payload: GalleryInput = {
      id: initial?.id ?? null,
      caption: caption.trim() || null,
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
      isActive,
      image: image
        ? {
            publicId: image.publicId,
            altText: image.altText,
            width: image.width,
            height: image.height,
          }
        : null,
    };

    const result = await saveGallery(payload);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    router.push("/admin/gallery");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-forest">
          {mode === "create" ? "Gambar Baru" : "Edit Gambar"}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/gallery")}
          >
            Batal
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/5 px-3 py-2 text-sm text-error">
          {formError}
        </p>
      )}

      <ImageUploadField label="Gambar" value={image} onChange={setImage} />
      {fieldErrors.image && (
        <p className="text-xs text-error">{fieldErrors.image}</p>
      )}

      <Field
        label="Caption"
        hint="Opsional. Keterangan singkat foto fasilitas/interaksi."
        error={fieldErrors.caption}
      >
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="mis. Ruang pemeriksaan dengan pencahayaan alami"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Urutan tampil" hint="Angka lebih kecil tampil lebih dulu.">
          <Input
            inputMode="numeric"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </Field>
        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-forest"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="text-sm text-forest">Tampilkan di website</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/gallery")}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan gambar"}
        </Button>
      </div>
    </form>
  );
}
