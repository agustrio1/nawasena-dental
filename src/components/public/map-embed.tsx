"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

/*
 * Peta dengan pemuatan tertunda (lazy), dua jalur:
 *
 *  1. Otomatis: iframe baru dibuat setelah kotak peta hampir masuk viewport
 *     (IntersectionObserver, rootMargin 200px -> mulai sedikit sebelum terlihat).
 *  2. Manual: pengguna bisa klik panel untuk memuat sekarang.
 *
 * Google Maps embed menarik cukup banyak resource (tile + script). Dengan menunda
 * pembuatan iframe sampai benar-benar akan dilihat, load awal halaman tetap ringan.
 *
 * Catatan lint/React: setActive() hanya dipanggil di dalam callback observer
 * (asinkron) dan di onClick — TIDAK ada setState sinkron di dalam body effect,
 * sehingga tidak memicu error "set-state-in-effect". Bila IntersectionObserver
 * tidak tersedia (browser lama), panel tetap bisa diklik sebagai fallback.
 *
 * Keamanan: `query` sudah divalidasi di server (karakter < > dibuang) dan selalu
 * di-encode lewat encodeURIComponent sebelum masuk URL, sehingga tidak ada
 * sisipan skrip. URL embed memakai maps.google.com (bukan HTML/JS buatan sendiri).
 */
function buildEmbedUrl(query: string): string {
  const q = encodeURIComponent(query.trim());
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}

export function MapEmbed({
  query,
  label,
  className,
}: {
  query: string;
  label?: string;
  className?: string;
}) {
  const [active, setActive] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const src = React.useMemo(() => buildEmbedUrl(query), [query]);

  React.useEffect(() => {
    // Sudah aktif (iframe terpasang) -> tak perlu observer.
    if (active) return;
    const el = ref.current;
    if (!el) return;
    // Browser tanpa IntersectionObserver: biarkan fallback tombol manual.
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  // Tanpa query: jangan render panel kosong — pemanggil yang menentukan fallback.
  if (!query.trim()) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-line bg-sage",
        className
      )}
    >
      {active ? (
        <iframe
          title={label ? `Peta: ${label}` : "Peta lokasi klinik"}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label="Muat peta lokasi"
          className="group flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
        >
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/30 text-forest transition-colors group-hover:border-forest"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
          </span>
          <span className="block max-w-[32ch] text-charcoal/80">
            {label ?? "Lokasi klinik"}
          </span>
          <span className="inline-flex items-center gap-1 text-small font-medium text-forest underline-offset-4 group-hover:underline">
            Muat peta
          </span>
          <span className="mt-1 text-xs text-charcoal/50">
            Peta dimuat otomatis saat terlihat, atau klik untuk memuat sekarang.
          </span>
        </button>
      )}
    </div>
  );
}
