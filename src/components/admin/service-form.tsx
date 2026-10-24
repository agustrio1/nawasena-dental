"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import {
  ImageUploadField,
  type ImageValue,
} from "@/components/admin/image-upload-field";
import {
  saveService,
  type ServiceInput,
} from "@/lib/actions/admin-services";
import type { AdminServiceEdit } from "@/lib/admin-data";

type FaqRow = { question: string; answer: string };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- Blok bantu tampilan (mengikuti pola form artikel) ---------- */

// Card: pemisah bagian. Tanpa shadow/gradient (aturan desain admin).
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
      className={`rounded-2xl border border-line bg-white p-4 sm:p-6 ${className}`}
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

/* ---------- Pratinjau SEO lokal (khusus layanan; tidak menyentuh seo-preview artikel) ---------- */

function ServiceSeoPreview({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description: string;
}) {
  const [view, setView] = React.useState<"desktop" | "mobile">("desktop");

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const path = `/layanan/${slug || "nama-layanan"}`;

  const shownTitle = title || "Nama layanan akan tampil di sini";
  const shownDesc =
    description ||
    "Ringkasan layanan (1-2 kalimat) akan tampil di sini sebagai teks pendukung hasil pencarian.";

  const isMobile = view === "mobile";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-charcoal/70">
          Pratinjau Google
        </span>
        <div
          role="tablist"
          aria-label="Mode pratinjau"
          className="inline-grid grid-cols-2 gap-0.5 rounded-lg bg-sage/40 p-0.5"
        >
          {(
            [
              { value: "desktop", label: "Desktop" },
              { value: "mobile", label: "HP" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={view === opt.value}
              onClick={() => setView(opt.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                view === opt.value
                  ? "bg-white text-forest"
                  : "text-charcoal/60 hover:text-forest"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`rounded-xl border border-line bg-white p-4 ${
          isMobile ? "mx-auto max-w-90" : ""
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-ivory/60 text-[11px] font-semibold text-forest">
            N
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs text-charcoal/80">{site}</p>
            <p className="truncate text-[11px] text-charcoal/50">
              {site}
              <span className="mx-1 text-charcoal/35">&#8250;</span>
              {path}
            </p>
          </div>
        </div>
        <p
          className={`mt-2 text-[#1a0dab] ${
            isMobile
              ? "line-clamp-2 text-base leading-snug"
              : "line-clamp-1 text-lg"
          }`}
        >
          {shownTitle}
        </p>
        <p
          className={`mt-1 text-charcoal/70 ${
            isMobile
              ? "line-clamp-3 text-[13px] leading-5"
              : "line-clamp-2 text-sm leading-5"
          }`}
        >
          {shownDesc}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SeoMeter label="Judul" value={title} ideal={60} max={70} min={20} />
        <SeoMeter
          label="Deskripsi"
          value={description}
          ideal={160}
          max={180}
          min={50}
        />
      </div>
    </div>
  );
}

function SeoMeter({
  label,
  value,
  ideal,
  max,
  min,
}: {
  label: string;
  value: string;
  ideal: number;
  max: number;
  min: number;
}) {
  const len = value.length;

  let text = "Belum diisi";
  let textClass = "text-charcoal/45";
  let barClass = "bg-charcoal/20";

  if (len > 0) {
    if (len > max) {
      text = "Terlalu panjang, bisa terpotong";
      textClass = "text-error";
      barClass = "bg-error";
    } else if (len > ideal) {
      text = "Sedikit melebihi ideal";
      textClass = "text-[#b45309]";
      barClass = "bg-[#d97706]";
    } else if (len < min) {
      text = "Agak pendek";
      textClass = "text-[#b45309]";
      barClass = "bg-[#d97706]";
    } else {
      text = "Panjang ideal";
      textClass = "text-forest";
      barClass = "bg-forest";
    }
  }

  const percent = Math.min(100, Math.round((len / ideal) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-charcoal/70">{label}</span>
        <span className="tabular-nums text-charcoal/55">
          {len}/{ideal}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Panjang ${label.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={ideal}
        aria-valuenow={len}
        className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal/10"
      >
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={`text-[11px] ${textClass}`}>{text}</p>
    </div>
  );
}

/* ---------- Form ---------- */

export function ServiceForm({
  initial,
  mode,
}: {
  initial?: AdminServiceEdit;
  mode: "create" | "edit";
}) {
  const router = useRouter();

  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [summary, setSummary] = React.useState(initial?.summary ?? "");
  const [description, setDescription] = React.useState(
    initial?.description ?? ""
  );
  const [availabilityNote, setAvailabilityNote] = React.useState(
    initial?.availabilityNote ?? ""
  );
  const [consultReasons, setConsultReasons] = React.useState(
    (initial?.consultReasons ?? []).join("\n")
  );
  const [processSteps, setProcessSteps] = React.useState(
    (initial?.processSteps ?? []).join("\n")
  );
  const [faqs, setFaqs] = React.useState<FaqRow[]>(
    initial?.faqs ?? [{ question: "", answer: "" }]
  );
  const [sortOrder, setSortOrder] = React.useState(
    String(initial?.sortOrder ?? 0)
  );
  const [status, setStatus] = React.useState<string>(
    initial?.status ?? "draft"
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

  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string>
  >({});

  function updateFaq(index: number, patch: Partial<FaqRow>) {
    setFaqs((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const finalSlug = slug.trim() !== "" ? slugify(slug) : slugify(name);

    const payload: ServiceInput = {
      id: initial?.id ?? null,
      name: name.trim(),
      slug: finalSlug,
      summary: summary.trim(),
      description: description.trim(),
      availabilityNote: availabilityNote.trim() || null,
      consultReasons: consultReasons
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      processSteps: processSteps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      faqs: faqs
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question !== "" && f.answer !== ""),
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
      status,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      cover: cover
        ? {
            publicId: cover.publicId,
            altText: cover.altText,
            width: cover.width,
            height: cover.height,
          }
        : null,
    };

    const result = await saveService(payload);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/admin/services");
    router.refresh();
  }

  const isPublished = status === "published";

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-6xl space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-white px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-charcoal/50">
              Layanan
            </p>
            <h1 className="truncate font-serif text-xl text-forest sm:text-2xl">
              {mode === "create" ? "Layanan Baru" : "Edit Layanan"}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/services")}
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
        {/* Kolom utama */}
        <div className="min-w-0 space-y-5">
          <Card>
            <Field label="Nama layanan" error={fieldErrors.name}>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="mis. Ortodonti"
                className="h-14 font-serif text-xl sm:text-2xl"
              />
            </Field>
          </Card>

          <Card
            title="Deskripsi"
            description="Penjelasan lengkap layanan untuk halaman detail."
          >
            <Field label="Isi deskripsi" error={fieldErrors.description}>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Jelaskan layanan dengan bahasa yang mudah dimengerti."
              />
            </Field>
          </Card>

          <Card
            title="Detail perawatan"
            description="Alasan konsultasi, tahapan, dan catatan ketersediaan."
          >
            <div className="space-y-4">
              <Field
                label="Alasan konsultasi"
                hint="Satu baris = satu poin."
              >
                <Textarea
                  value={consultReasons}
                  onChange={(e) => setConsultReasons(e.target.value)}
                  rows={5}
                  placeholder={"Gigi sensitif\nNyeri saat mengunyah"}
                />
              </Field>
              <Field label="Tahapan proses" hint="Satu baris = satu langkah.">
                <Textarea
                  value={processSteps}
                  onChange={(e) => setProcessSteps(e.target.value)}
                  rows={5}
                  placeholder={"Pemeriksaan awal\nRencana perawatan"}
                />
              </Field>
              <Field
                label="Catatan ketersediaan"
                hint="Opsional. Mis. ketergantungan pada dokter/fasilitas."
                error={fieldErrors.availabilityNote}
              >
                <Input
                  value={availabilityNote}
                  onChange={(e) => setAvailabilityNote(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="FAQ layanan"
            description="Pertanyaan yang sering muncul untuk layanan ini."
          >
            <div className="space-y-3">
              {faqs.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border border-line bg-ivory/40 p-3 md:grid-cols-[1fr_2fr_auto]"
                >
                  <Input
                    value={row.question}
                    onChange={(e) =>
                      updateFaq(index, { question: e.target.value })
                    }
                    placeholder="Pertanyaan"
                  />
                  <Input
                    value={row.answer}
                    onChange={(e) => updateFaq(index, { answer: e.target.value })}
                    placeholder="Jawaban"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFaqs((rows) =>
                        rows.length > 1
                          ? rows.filter((_, i) => i !== index)
                          : rows
                      )
                    }
                  >
                    Hapus
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFaqs((rows) => [...rows, { question: "", answer: "" }])
                }
              >
                Tambah FAQ
              </Button>
            </div>
          </Card>
        </div>

        {/* Panel samping */}
        <aside className="min-w-0 space-y-5">
          <Card title="Publikasi">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-forest">Status</span>
                <div
                  role="radiogroup"
                  aria-label="Status layanan"
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
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-white text-forest"
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
                    ? "Layanan akan tampil di situs."
                    : "Layanan hanya tersimpan sebagai draf."}
                </p>
              </div>

              <Field
                label="Urutan tampil"
                hint="Angka lebih kecil tampil lebih dulu."
              >
                <Input
                  inputMode="numeric"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Ringkasan & URL"
            description="Ringkasan tampil di kartu layanan; slug pada alamat halaman."
          >
            <div className="space-y-4">
              <Field
                label="Ringkasan"
                hint="Satu-dua kalimat untuk kartu layanan."
                error={fieldErrors.summary}
                counter={<Counter value={summary.length} max={200} />}
              >
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                />
              </Field>

              <Field
                label="Slug"
                hint="Otomatis dari nama bila kosong."
                error={fieldErrors.slug}
              >
                <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-white focus-within:ring-2 focus-within:ring-forest focus-within:ring-offset-2">
                  <span className="flex shrink-0 items-center border-r border-line bg-ivory/60 px-3 text-xs text-charcoal/55">
                    /layanan/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-charcoal outline-none"
                    placeholder="ortodonti"
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
            description="Tampilan layanan di hasil pencarian."
          >
            <div className="space-y-4">
              <Field
                label="Meta title"
                hint="Kosong = pakai nama layanan."
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
              <ServiceSeoPreview
                slug={slug.trim() || slugify(name)}
                title={seoTitle.trim() || name.trim()}
                description={seoDescription.trim() || summary.trim()}
              />
            </div>
          </Card>
        </aside>
      </div>

      {/* Aksi bawah (sticky) */}
      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-line bg-white p-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/services")}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan layanan"}
        </Button>
      </div>
    </form>
  );
}
