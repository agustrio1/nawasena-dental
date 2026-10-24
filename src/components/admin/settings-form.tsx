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
  saveSettings,
  type SiteSettingsInput,
} from "@/lib/actions/admin-settings";
import type { AdminSiteSettings } from "@/lib/admin-data";

/* ---------- Blok bantu ---------- */

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

function SectionNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-sage/30 px-3 py-2 text-xs text-charcoal/70">
      {children}
    </p>
  );
}

const TABS = [
  { key: "umum", label: "Umum" },
  { key: "penampilan", label: "Penampilan" },
  { key: "seo", label: "SEO" },
  { key: "sosial", label: "Sosial Media" },
  { key: "analitik", label: "Analitik & Verifikasi" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type TextField =
  | "clinicName"
  | "addressText"
  | "hoursText"
  | "whatsappNumber"
  | "seoTitle"
  | "seoDescription"
  | "seoKeywords"
  | "instagramUrl"
  | "facebookUrl"
  | "tiktokUrl"
  | "youtubeUrl"
  | "googleAnalyticsId"
  | "googleTagManagerId"
  | "metaPixelId"
  | "googleSiteVerification"
  | "bingVerification"
  | "facebookDomainVerification"
  | "mapsQuery";

function imgFrom(publicId: string | null): ImageValue | null {
  return publicId ? { publicId, altText: "", width: 0, height: 0 } : null;
}

export function SettingsForm({ initial }: { initial: AdminSiteSettings }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabKey>("umum");

  const [text, setText] = React.useState<Record<TextField, string>>({
    clinicName: initial.clinicName,
    addressText: initial.addressText,
    hoursText: initial.hoursText,
    whatsappNumber: initial.whatsappNumber,
    seoTitle: initial.seoTitle ?? "",
    seoDescription: initial.seoDescription ?? "",
    seoKeywords: (initial.seoKeywords ?? []).join(", "),
    instagramUrl: initial.instagramUrl ?? "",
    facebookUrl: initial.facebookUrl ?? "",
    tiktokUrl: initial.tiktokUrl ?? "",
    youtubeUrl: initial.youtubeUrl ?? "",
    googleAnalyticsId: initial.googleAnalyticsId ?? "",
    googleTagManagerId: initial.googleTagManagerId ?? "",
    metaPixelId: initial.metaPixelId ?? "",
    googleSiteVerification: initial.googleSiteVerification ?? "",
    bingVerification: initial.bingVerification ?? "",
    facebookDomainVerification: initial.facebookDomainVerification ?? "",
    mapsQuery: initial.mapsQuery ?? "",
  });

  const [favicon, setFavicon] = React.useState<ImageValue | null>(
    imgFrom(initial.faviconPublicId)
  );
  const [logo, setLogo] = React.useState<ImageValue | null>(
    imgFrom(initial.logoPublicId)
  );
  const [heroImage, setHeroImage] = React.useState<ImageValue | null>(
    imgFrom(initial.heroImagePublicId)
  );
  const [ogImage, setOgImage] = React.useState<ImageValue | null>(
    imgFrom(initial.ogImagePublicId)
  );

  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );

  function set(key: TextField, value: string) {
    setText((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    setFormError(null);
    setFieldErrors({});

    const payload: SiteSettingsInput = {
      clinicName: text.clinicName.trim(),
      addressText: text.addressText.trim(),
      hoursText: text.hoursText.trim(),
      whatsappNumber: text.whatsappNumber,
      faviconPublicId: favicon?.publicId ?? "",
      logoPublicId: logo?.publicId ?? "",
      heroImagePublicId: heroImage?.publicId ?? "",
      seoTitle: text.seoTitle.trim(),
      seoDescription: text.seoDescription.trim(),
      seoKeywords: text.seoKeywords,
      ogImagePublicId: ogImage?.publicId ?? "",
      instagramUrl: text.instagramUrl.trim(),
      facebookUrl: text.facebookUrl.trim(),
      tiktokUrl: text.tiktokUrl.trim(),
      youtubeUrl: text.youtubeUrl.trim(),
      googleAnalyticsId: text.googleAnalyticsId.trim(),
      googleTagManagerId: text.googleTagManagerId.trim(),
      metaPixelId: text.metaPixelId.trim(),
      googleSiteVerification: text.googleSiteVerification.trim(),
      bingVerification: text.bingVerification.trim(),
      facebookDomainVerification: text.facebookDomainVerification.trim(),
      mapsQuery: text.mapsQuery.trim(),
    };

    const result = await saveSettings(payload);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      // Lompat ke tab pertama yang memiliki error agar terlihat pengguna.
      const errorTab = firstTabWithError(result.fieldErrors ?? {});
      if (errorTab) setTab(errorTab);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  const waDigits = text.whatsappNumber.replace(/\D/g, "");

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-forest">Pengaturan Situs</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Informasi ini dipakai di seluruh website (footer, kontak, tombol
          WhatsApp, metadata SEO, favicon, analitik, dan verifikasi mesin
          pencari). Perubahan berlaku segera di halaman publik.
        </p>
      </div>

      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/5 px-3 py-2 text-sm text-error">
          {formError}
        </p>
      )}

      {/* Tab navigation */}
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-line"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-forest text-forest"
                : "border-transparent text-charcoal/55 hover:text-charcoal"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-6" role="tabpanel">
        {tab === "umum" && (
          <>
            <Field label="Nama klinik" error={fieldErrors.clinicName}>
              <Input
                value={text.clinicName}
                onChange={(e) => set("clinicName", e.target.value)}
                placeholder="Nawasena Dental Care"
              />
            </Field>

            <Field
              label="Alamat"
              hint="Untuk website demo, gunakan alamat yang jelas berlabel placeholder."
              error={fieldErrors.addressText}
            >
              <Textarea
                value={text.addressText}
                onChange={(e) => set("addressText", e.target.value)}
                rows={2}
              />
            </Field>

            <Field label="Jam operasional" error={fieldErrors.hoursText}>
              <Textarea
                value={text.hoursText}
                onChange={(e) => set("hoursText", e.target.value)}
                rows={2}
                placeholder="Senin - Jumat: 08.00 - 20.00 | Sabtu: 08.00 - 17.00"
              />
            </Field>

            <Field
              label="Nomor WhatsApp"
              hint="Format internasional tanpa tanda +. Contoh: 6281234567890."
              error={fieldErrors.whatsappNumber}
            >
              <Input
                inputMode="tel"
                value={text.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                placeholder="6281234567890"
              />
            </Field>

            {waDigits.length >= 8 && (
              <p className="text-xs text-charcoal/55">
                Tautan yang dihasilkan:{" "}
                <span className="font-mono text-charcoal/75">
                  https://wa.me/{waDigits}
                </span>
              </p>
            )}

            <Field
              label="Lokasi di peta"
              hint="Alamat atau nama tempat yang dikenali Google Maps (mis. nama jalan + kota, atau nama klinik). Jika kosong, peta menampilkan tombol untuk membuka hasil pencarian dari teks alamat."
              error={fieldErrors.mapsQuery}
            >
              <Textarea
                value={text.mapsQuery}
                onChange={(e) => set("mapsQuery", e.target.value)}
                rows={2}
                placeholder="Jl. Contoh No. 1, Jakarta"
              />
            </Field>
          </>
        )}

        {tab === "penampilan" && (
          <>
            <SectionNote>
              Gambar diunggah aman melalui Cloudinary (server-side). Untuk
              favicon, gunakan gambar persegi minimal 48×48 px (PNG). Logo
              dipakai sebagai identifikasi brand. Banner hero disarankan
              potret ~4:5 (mis. 1000×1250 px); bila kosong, home memakai foto
              galeri pertama.
            </SectionNote>
            <ImageUploadField
              label="Favicon / ikon website"
              value={favicon}
              onChange={setFavicon}
            />
            <ImageUploadField
              label="Logo"
              value={logo}
              onChange={setLogo}
            />
            <ImageUploadField
              label="Gambar banner (hero) halaman home"
              value={heroImage}
              onChange={setHeroImage}
            />
          </>
        )}

        {tab === "seo" && (
          <>
            <SectionNote>
              Nilai ini menjadi default metadata seluruh halaman. Halaman
              tertentu (layanan/artikel) dapat mengoverride judul &
              deskripsinya sendiri.
            </SectionNote>
            <Field
              label="Judul SEO default"
              hint="Kosongkan untuk memakai nama klinik. Idealnya ≤ 60 karakter."
              error={fieldErrors.seoTitle}
            >
              <Input
                value={text.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                placeholder="Nawasena Dental Care"
              />
            </Field>
            <Field
              label="Deskripsi SEO default"
              hint="Ringkasan untuk hasil pencarian. Idealnya 120-160 karakter."
              error={fieldErrors.seoDescription}
            >
              <Textarea
                value={text.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                rows={3}
              />
            </Field>
            <Field
              label="Kata kunci (keywords)"
              hint="Pisahkan dengan koma. Maksimal 20 kata kunci."
              error={fieldErrors.seoKeywords}
            >
              <Input
                value={text.seoKeywords}
                onChange={(e) => set("seoKeywords", e.target.value)}
                placeholder="klinik gigi, ortodonti, scaling"
              />
            </Field>
            <ImageUploadField
              label="Gambar tautan sosial (Open Graph)"
              value={ogImage}
              onChange={setOgImage}
            />
          </>
        )}

        {tab === "sosial" && (
          <>
            <SectionNote>
              Hanya alamat publik (http/https) yang diterima. Tautan akan
              tampil sebagai ikon di footer website.
            </SectionNote>
            <Field label="Instagram" error={fieldErrors.instagramUrl}>
              <Input
                value={text.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/namasaya"
              />
            </Field>
            <Field label="Facebook" error={fieldErrors.facebookUrl}>
              <Input
                value={text.facebookUrl}
                onChange={(e) => set("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/namasaya"
              />
            </Field>
            <Field label="TikTok" error={fieldErrors.tiktokUrl}>
              <Input
                value={text.tiktokUrl}
                onChange={(e) => set("tiktokUrl", e.target.value)}
                placeholder="https://tiktok.com/@namasaya"
              />
            </Field>
            <Field label="YouTube" error={fieldErrors.youtubeUrl}>
              <Input
                value={text.youtubeUrl}
                onChange={(e) => set("youtubeUrl", e.target.value)}
                placeholder="https://youtube.com/@namasaya"
              />
            </Field>
          </>
        )}

        {tab === "analitik" && (
          <>
            <SectionNote>
              <strong>Jangan menempelkan secret di sini.</strong> Field ini
              khusus nilai yang memang publik (muncul di HTML): ID GA4/GTM/
              Pixel dan token verifikasi. API key, DATABASE_URL, atau service
              account key tidak boleh disimpan di halaman ini.
            </SectionNote>

            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold tracking-wide text-forest">
                Analitik
              </h2>
            </div>
            <Field
              label="Google Analytics 4 (Measurement ID)"
              hint="Format: G-XXXXXXXXXX. Kosongkan jika tidak dipakai."
              error={fieldErrors.googleAnalyticsId}
            >
              <Input
                value={text.googleAnalyticsId}
                onChange={(e) => set("googleAnalyticsId", e.target.value)}
                placeholder="G-ABC12D3E4F"
              />
            </Field>
            <Field
              label="Google Tag Manager (Container ID)"
              hint="Format: GTM-XXXXXX."
              error={fieldErrors.googleTagManagerId}
            >
              <Input
                value={text.googleTagManagerId}
                onChange={(e) => set("googleTagManagerId", e.target.value)}
                placeholder="GTM-ABC123"
              />
            </Field>
            <Field
              label="Meta (Facebook) Pixel ID"
              hint="Hanya angka (6-20 digit)."
              error={fieldErrors.metaPixelId}
            >
              <Input
                inputMode="numeric"
                value={text.metaPixelId}
                onChange={(e) => set("metaPixelId", e.target.value)}
                placeholder="1234567890123456"
              />
            </Field>

            <div className="space-y-1.5 pt-2">
              <h2 className="text-sm font-semibold tracking-wide text-forest">
                Verifikasi mesin pencari / jaringan
              </h2>
            </div>
            <Field
              label="Google Search Console"
              hint="Nilai meta tag google-site-verification."
              error={fieldErrors.googleSiteVerification}
            >
              <Input
                value={text.googleSiteVerification}
                onChange={(e) => set("googleSiteVerification", e.target.value)}
              />
            </Field>
            <Field
              label="Bing (msvalidate.01)"
              error={fieldErrors.bingVerification}
            >
              <Input
                value={text.bingVerification}
                onChange={(e) => set("bingVerification", e.target.value)}
              />
            </Field>
            <Field
              label="Facebook Domain Verification"
              error={fieldErrors.facebookDomainVerification}
            >
              <Input
                value={text.facebookDomainVerification}
                onChange={(e) =>
                  set("facebookDomainVerification", e.target.value)
                }
              />
            </Field>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan pengaturan"}
        </Button>
        {saved && <span className="text-sm text-forest">Tersimpan.</span>}
        {initial.updatedAt && (
          <span className="ml-auto text-xs text-charcoal/45">
            Terakhir diperbarui:{" "}
            {new Date(initial.updatedAt).toLocaleString("id-ID")}
          </span>
        )}
      </div>
    </form>
  );
}

/* Peta field -> tab, untuk melompat ke tab tempat error berada. */
const FIELD_TAB: Record<string, TabKey> = {
  clinicName: "umum",
  addressText: "umum",
  hoursText: "umum",
  whatsappNumber: "umum",
  mapsQuery: "umum",
  faviconPublicId: "penampilan",
  logoPublicId: "penampilan",
  heroImagePublicId: "penampilan",
  seoTitle: "seo",
  seoDescription: "seo",
  seoKeywords: "seo",
  ogImagePublicId: "seo",
  instagramUrl: "sosial",
  facebookUrl: "sosial",
  tiktokUrl: "sosial",
  youtubeUrl: "sosial",
  googleAnalyticsId: "analitik",
  googleTagManagerId: "analitik",
  metaPixelId: "analitik",
  googleSiteVerification: "analitik",
  bingVerification: "analitik",
  facebookDomainVerification: "analitik",
};

function firstTabWithError(
  fieldErrors: Record<string, string>
): TabKey | null {
  for (const key of Object.keys(fieldErrors)) {
    const tabKey = FIELD_TAB[key];
    if (tabKey) return tabKey;
  }
  return null;
}
