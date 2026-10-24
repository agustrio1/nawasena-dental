"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { saveCategory, type CategoryInput } from "@/lib/actions/admin-categories";
import type { AdminCategoryEdit } from "@/lib/admin-data";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export function CategoryForm({
  initial,
  mode,
}: {
  initial?: AdminCategoryEdit;
  mode: "create" | "edit";
}) {
  const router = useRouter();

  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");

  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const payload: CategoryInput = {
      id: initial?.id ?? null,
      name: name.trim(),
      slug: slug.trim(),
    };

    const result = await saveCategory(payload);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-forest">
          {mode === "create" ? "Kategori Baru" : "Edit Kategori"}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/categories")}
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

      <Field label="Nama kategori" error={fieldErrors.name}>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="mis. Ortodonti"
        />
      </Field>

      <Field
        label="Slug"
        hint="Dipakai pada URL/penyaringan. Kosongkan untuk otomatis dari nama."
        error={fieldErrors.slug}
      >
        <Input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="ortodonti"
        />
      </Field>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/categories")}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Kategori"}
        </Button>
      </div>
    </form>
  );
}
