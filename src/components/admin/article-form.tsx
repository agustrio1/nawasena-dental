"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { RichTextEditor } from "@/components/admin/ui/rich-text-editor";
import {
  ImageUploadField,
  type ImageValue,
} from "@/components/admin/image-upload-field";
import { SeoPreview } from "@/components/admin/seo-preview";
import { JsonLdEditor } from "@/components/admin/jsonld-editor";
import { cloudinaryPreviewUrl } from "@/lib/cloudinary-client";
import {
  saveArticle,
  type ArticleInput,
} from "@/lib/actions/admin-articles";
import type { AdminArticleEdit, AdminCategoryOption } from "@/lib/admin-data";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Card({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {(title || description) && (
        <header className="mb-4 space-y-0.5">
          {title && (
            <h2 className="text-sm font-semibold tracking-wide text-forest">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-xs text-charcoal/55">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-forest">{label}</span>
        {counter && (
          <span className="text-[11px] tabular-nums text-charcoal/50">
            {counter}
          </span>
        )}
      </span>
      {children}
      {hint && !error && (
        <span className="block text-xs text-charcoal/55">{hint}</span>
      )}
      {error && <span className="block text-xs text-error">{error}</span>}
    </label>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span className={value > max ? "font-medium text-error" : undefined}>
      {value}/{max}
    </span>
  );
}

const selectClass =
  "flex h-10 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2";

export function ArticleForm({
  categories,
  initial,
  mode,
}: {
  categories: AdminCategoryOption[];
  initial?: AdminArticleEdit;
  mode: "create" | "edit";
}) {
  const router = useRouter();

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [content, setContent] = React.useState(initial?.content ?? "");
  const [categoryId, setCategoryId] = React.useState(
    initial?.categoryId ?? categories[0]?.id ?? ""
  );
  const [status, setStatus] = React.useState<string>(
    initial?.status ?? "draft"
  );
  const [publishedAt, setPublishedAt] = React.useState(
    initial?.publishedAt ? initial.publishedAt.slice(0, 10) : ""
  );
  const [isReviewed, setIsReviewed] = React.useState(
    initial?.isProfessionallyReviewed ?? false
  );
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(
    initial?.seoDescription ?? ""
  );
  const [cover, setCover] = React.useState<ImageValue | null>(
    initial?.cover
      ? {
          publicId: initial.cover.publicId,
          altText: initial.cover.altText,
          width: initial.cover.width,
          height: initial.cover.height,
        }
      : null
  );
  const [schemaJson, setSchemaJson] = React.useState<
    Record<string, unknown> | null
  >(initial?.schemaJson ?? null);

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

    const finalSlug = slug.trim() !== "" ? slugify(slug) : slugify(title);

    const payload: ArticleInput = {
      id: initial?.id ?? null,
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content,
      categoryId,
      status,
      publishedAt: publishedAt || null,
      isProfessionallyReviewed: isReviewed,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      schemaJson,
      cover: cover
        ? {
            publicId: cover.publicId,
            altText: cover.altText,
            width: cover.width,
            height: cover.height,
          }
        : null,
    };

    const result = await saveArticle(payload);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  const jsonldContext = {
    slug: slug.trim() || slugify(title),
    title: title.trim(),
    description: seoDescription.trim() || excerpt.trim(),
    coverUrl: cover ? cloudinaryPreviewUrl(cover.publicId, 1600) : "",
    date: publishedAt || (initial?.publishedAt ?? "").slice(0, 10),
  };

  const isPublished = status === "published";

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-6xl space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-white px-4 py-3 shadow-sm sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-charcoal/50">
              Artikel
            </p>
            <h1 className="truncate font-serif text-xl text-forest sm:text-2xl">
              {mode === "create" ? "Artikel Baru" : "Edit Artikel"}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/articles")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-error/40 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {formError}
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Kolom utama: Judul, Konten, JSON-LD */}
        <div className="min-w-0 space-y-5">
          <Card>
            <Field label="Judul artikel" error={fieldErrors.title}>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="mis. Cara menjaga kesehatan gigi sehari-hari"
                className="h-14 font-serif text-xl sm:text-2xl"
              />
            </Field>
          </Card>

          <Card title="Konten" description="Isi lengkap artikel. Ketik / untuk menyisipkan blok.">
            <div className="space-y-1.5">
              <div className="overflow-hidden rounded-lg">
                <RichTextEditor
                  key={initial?.id ?? "new"}
                  value={content}
                  onChange={setContent}
                />
              </div>
              {fieldErrors.content && (
                <span className="block text-xs text-error">
                  {fieldErrors.content}
                </span>
              )}
            </div>
          </Card>

          <JsonLdEditor
            key={`jsonld-${initial?.id ?? "new"}`}
            context={jsonldContext}
            value={schemaJson}
            onChange={setSchemaJson}
          />
        </div>

        {/* Panel samping */}
        <aside className="min-w-0 space-y-5">
          <Card title="Publikasi">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-forest">Status</span>
                <div
                  role="radiogroup"
                  aria-label="Status artikel"
                  className="grid grid-cols-2 gap-1 rounded-xl bg-sage/40 p-1"
                >
                  {[
                    { value: "draft", label: "Draf" },
                    { value: "published", label: "Terbit" },
                  ].map((opt) => {
                    const active = status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setStatus(opt.value)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                          active
                            ? "bg-white text-forest shadow-sm"
                            : "text-charcoal/60 hover:text-forest"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-charcoal/55">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      isPublished ? "bg-forest" : "bg-charcoal/30"
                    }`}
                  />
                  {isPublished
                    ? "Artikel akan tampil di situs."
                    : "Artikel hanya tersimpan sebagai draf."}
                </p>
              </div>

              <Field
                label="Tanggal terbit"
                hint="Kosong + terbit = otomatis hari ini."
              >
                <Input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
              </Field>

              <Field label="Kategori" error={fieldErrors.categoryId}>
                <select
                  className={selectClass}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.length === 0 && (
                    <option value="">(tanpa kategori)</option>
                  )}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-ivory/40 p-3 transition-colors hover:bg-sage/30">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-forest"
                  checked={isReviewed}
                  onChange={(e) => setIsReviewed(e.target.checked)}
                />
                <span className="text-sm text-forest">
                  Sudah ditinjau profesional
                  <span className="block text-xs text-charcoal/55">
                    Tandai bila dokter gigi sudah memeriksa isi artikel.
                  </span>
                </span>
              </label>
            </div>
          </Card>

          <Card
            title="Ringkasan & URL"
            description="Tampil di daftar artikel dan alamat halaman."
          >
            <div className="space-y-4">
              <Field
                label="Ringkasan"
                hint="Pratinjau singkat di daftar artikel."
                error={fieldErrors.excerpt}
                counter={<Counter value={excerpt.length} max={200} />}
              >
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={4}
                />
              </Field>

              <Field
                label="Slug"
                hint="Otomatis dari judul bila kosong."
                error={fieldErrors.slug}
              >
                <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-white focus-within:ring-2 focus-within:ring-forest focus-within:ring-offset-2">
                  <span className="flex shrink-0 items-center border-r border-line bg-ivory/60 px-3 text-xs text-charcoal/55">
                    /artikel/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-charcoal outline-none"
                    placeholder="slug-artikel"
                  />
                </div>
              </Field>
            </div>
          </Card>

          <ImageUploadField
            label="Gambar sampul"
            value={cover}
            onChange={setCover}
          />

          <Card
            title="SEO & Pratinjau"
            description="Tampilan artikel di hasil pencarian."
          >
            <div className="space-y-4">
              <Field
                label="Meta title"
                hint="Kosong = pakai judul."
                counter={<Counter value={seoTitle.length} max={60} />}
              >
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </Field>
              <Field
                label="Meta description"
                hint="Kosong = pakai ringkasan."
                counter={<Counter value={seoDescription.length} max={160} />}
              >
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                />
              </Field>
              <SeoPreview
                slug={slug.trim() || slugify(title)}
                title={seoTitle.trim() || title.trim()}
                description={seoDescription.trim() || excerpt.trim()}
              />
            </div>
          </Card>
        </aside>
      </div>

      {/* Aksi bawah (sticky di bawah layar) */}
      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-line bg-white/90 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/articles")}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan artikel"}
        </Button>
      </div>
    </form>
  );
}