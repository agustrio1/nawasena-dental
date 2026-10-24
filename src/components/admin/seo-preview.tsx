"use client";

import * as React from "react";

// Pratinjau hasil di mesin pencari (gaya Yoast/RankMath), tanpa shadow/gradient.
export function SeoPreview({
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
  const path = `/artikel/${slug || "judul-artikel"}`;

  const shownTitle = title || "Judul artikel akan tampil di sini";
  const shownDesc =
    description ||
    "Deskripsi meta (ringkasan 1-2 kalimat) akan tampil di sini sebagai teks pendukung hasil pencarian.";

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
        <Meter label="Judul" value={title} ideal={60} max={70} min={30} />
        <Meter
          label="Deskripsi"
          value={description}
          ideal={160}
          max={180}
          min={70}
        />
      </div>
    </div>
  );
}

function Meter({
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