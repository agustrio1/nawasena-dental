"use client";

import * as React from "react";

type GuidedFields = {
  type: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  publisherName: string;
};

export type JsonLdContext = {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  date: string;
};

const TYPES = ["BlogPosting", "Article", "NewsArticle"];

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

function seedFromValue(
  value: Record<string, unknown> | null,
  ctx: JsonLdContext
): GuidedFields {
  if (!value) {
    return {
      type: "BlogPosting",
      headline: ctx.title,
      description: ctx.description,
      image: ctx.coverUrl,
      datePublished: ctx.date,
      dateModified: ctx.date,
      authorName: "Nawasena Dental Care",
      publisherName: "Nawasena Dental Care",
    };
  }
  const asStr = (v: unknown): string =>
    typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : "";
  const author = value["author"];
  const publisher = value["publisher"];
  return {
    type: typeof value["@type"] === "string" ? (value["@type"] as string) : "BlogPosting",
    headline: asStr(value["headline"]),
    description: asStr(value["description"]),
    image: asStr(value["image"]),
    datePublished: asStr(value["datePublished"]),
    dateModified: asStr(value["dateModified"]),
    authorName:
      author && typeof author === "object"
        ? asStr((author as Record<string, unknown>)["name"])
        : asStr(author),
    publisherName:
      publisher && typeof publisher === "object"
        ? asStr((publisher as Record<string, unknown>)["name"])
        : asStr(publisher),
  };
}

function buildObject(f: GuidedFields, ctx: JsonLdContext): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": f.type || "BlogPosting",
    mainEntityOfPage: `${siteOrigin()}/artikel/${ctx.slug || "slug"}`,
    headline: f.headline,
  };
  if (f.description) obj["description"] = f.description;
  const images = f.image.split(",").map((s) => s.trim()).filter(Boolean);
  if (images.length) obj["image"] = images.length === 1 ? images[0] : images;
  if (f.datePublished) obj["datePublished"] = f.datePublished;
  if (f.dateModified) obj["dateModified"] = f.dateModified;
  if (f.authorName) obj["author"] = { "@type": "Person", name: f.authorName };
  if (f.publisherName)
    obj["publisher"] = { "@type": "Organization", name: f.publisherName };
  return obj;
}

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/35 focus:border-forest focus:ring-2 focus:ring-forest/20";

function MiniField({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-charcoal/70">{label}</span>
      {children}
    </label>
  );
}

export function JsonLdEditor({
  context,
  value,
  onChange,
}: {
  context: JsonLdContext;
  value: Record<string, unknown> | null;
  onChange: (next: Record<string, unknown> | null) => void;
}) {
  const [enabled, setEnabled] = React.useState(value != null);
  const [mode, setMode] = React.useState<"guided" | "raw">("guided");
  const [fields, setFields] = React.useState<GuidedFields>(() =>
    seedFromValue(value, context)
  );
  const [rawText, setRawText] = React.useState(
    () => JSON.stringify(value ?? buildObject(fields, context), null, 2)
  );
  const [rawError, setRawError] = React.useState<string | null>(null);

  function updateField(patch: Partial<GuidedFields>) {
    const next = { ...fields, ...patch };
    setFields(next);
    const obj = buildObject(next, context);
    onChange(obj);
    setRawText(JSON.stringify(obj, null, 2));
    setRawError(null);
  }

  function toggleEnabled(on: boolean) {
    setEnabled(on);
    if (on) {
      const obj = buildObject(fields, context);
      setRawText(JSON.stringify(obj, null, 2));
      setRawError(null);
      onChange(obj);
    } else {
      onChange(null);
    }
  }

  function applyRaw(text: string) {
    setRawText(text);
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setRawError(null);
        onChange(parsed as Record<string, unknown>);
      } else {
        setRawError("JSON harus berupa objek ({ }).");
      }
    } catch {
      setRawError("JSON tidak valid — periksa tanda kutip/koma.");
    }
  }

  function switchMode(m: "guided" | "raw") {
    setMode(m);
    if (m === "raw") {
      setRawText(JSON.stringify(buildObject(fields, context), null, 2));
      setRawError(null);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <header className="space-y-0.5">
          <h2 className="text-sm font-semibold tracking-wide text-forest">
            JSON-LD (Schema)
          </h2>
          <p className="text-xs text-charcoal/55">
            Data terstruktur khusus untuk artikel ini agar lebih mudah dipahami
            mesin pencari.
          </p>
        </header>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Sertakan JSON-LD khusus untuk artikel ini"
          onClick={() => toggleEnabled(!enabled)}
          className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
            enabled ? "bg-forest" : "bg-charcoal/25"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {!enabled && (
        <p className="mt-4 rounded-xl border border-dashed border-line bg-ivory/50 px-4 py-3 text-xs text-charcoal/55">
          Nonaktif. Artikel memakai JSON-LD bawaan situs. Aktifkan toggle untuk
          mengubahnya.
        </p>
      )}

      {enabled && (
        <div className="mt-5 space-y-5">
          <div
            role="tablist"
            aria-label="Mode editor"
            className="grid grid-cols-2 gap-1 rounded-xl bg-sage/40 p-1 sm:inline-grid sm:w-fit"
          >
            {(["guided", "raw"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-white text-forest shadow-sm"
                    : "text-charcoal/60 hover:text-forest"
                }`}
              >
                {m === "guided" ? "Terpandu" : "JSON mentah"}
              </button>
            ))}
          </div>

          {mode === "guided" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniField label="Tipe schema">
                <select
                  className={inputClass}
                  value={fields.type}
                  onChange={(e) => updateField({ type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </MiniField>
              <MiniField label="Nama penulis / organisasi">
                <input
                  className={inputClass}
                  value={fields.authorName}
                  onChange={(e) => updateField({ authorName: e.target.value })}
                />
              </MiniField>
              <MiniField label="Headline (judul)" className="sm:col-span-2">
                <input
                  className={inputClass}
                  value={fields.headline}
                  onChange={(e) => updateField({ headline: e.target.value })}
                />
              </MiniField>
              <MiniField label="Deskripsi" className="sm:col-span-2">
                <input
                  className={inputClass}
                  value={fields.description}
                  onChange={(e) => updateField({ description: e.target.value })}
                />
              </MiniField>
              <MiniField
                label="URL gambar (pisahkan dengan koma untuk banyak)"
                className="sm:col-span-2"
              >
                <input
                  className={inputClass}
                  value={fields.image}
                  onChange={(e) => updateField({ image: e.target.value })}
                />
              </MiniField>
              <MiniField label="datePublished (ISO, opsional)">
                <input
                  className={inputClass}
                  value={fields.datePublished}
                  onChange={(e) => updateField({ datePublished: e.target.value })}
                  placeholder="2026-10-23"
                />
              </MiniField>
              <MiniField label="dateModified (ISO, opsional)">
                <input
                  className={inputClass}
                  value={fields.dateModified}
                  onChange={(e) => updateField({ dateModified: e.target.value })}
                  placeholder="2026-10-23"
                />
              </MiniField>
              <MiniField label="Nama penerbit" className="sm:col-span-2">
                <input
                  className={inputClass}
                  value={fields.publisherName}
                  onChange={(e) => updateField({ publisherName: e.target.value })}
                />
              </MiniField>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={14}
                spellCheck={false}
                className={`w-full rounded-lg border bg-white px-3 py-2 font-mono text-xs leading-5 text-charcoal outline-none transition-colors focus:ring-2 ${
                  rawError
                    ? "border-error/60 focus:ring-error/20"
                    : "border-line focus:border-forest focus:ring-forest/20"
                }`}
                value={rawText}
                onChange={(e) => applyRaw(e.target.value)}
              />
              {rawError ? (
                <p
                  role="alert"
                  className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1 text-xs text-error"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-error" />
                  {rawError}
                </p>
              ) : (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-sage/60 px-2.5 py-1 text-xs text-forest">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  JSON valid
                </p>
              )}
            </div>
          )}

          <details className="group rounded-xl border border-line bg-ivory/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-medium text-charcoal/70 [&::-webkit-details-marker]:hidden">
              <span>Pratinjau JSON-LD</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 transition-transform group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <pre className="max-h-64 overflow-auto border-t border-line p-4 text-[11px] leading-5 text-charcoal/80">
              {rawText}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}