"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { getAdminActor } from "@/lib/admin-authz";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

/* ------------------------------------------------------------------
 * KEAMANAN / PENCEGAHAN KEBOCORAN DATA
 * ------------------------------------------------------------------
 * Seluruh field di halaman Pengaturan ini bernilai PUBLIK by design:
 * mereka muncul di <head>/HTML halaman (favicon, meta SEO, tautan
 * sosial, ID analitik, token verifikasi). JANGAN pernah memasukkan
 * secret ke sini (API secret Cloudinary, DATABASE_URL, service account
 * key, dsb). Field gambar hanya menyimpan publicId, bukan secret.
 *
 * Validasi ketat di server:
 *  - URL sosial: wajib http/https (blokir javascript:/data: -> XSS).
 *  - publicId gambar: hanya karakter aman Cloudinary.
 *  - ID analitik & token verifikasi: pola kaku (tanpa < > " spasi).
 * Server Action ini juga tetap dipagar peran admin (getAdminActor).
 * ---------------------------------------------------------------- */

export type SiteSettingsInput = {
  clinicName: string;
  addressText: string;
  hoursText: string;
  whatsappNumber: string;
  faviconPublicId: string;
  logoPublicId: string;
  heroImagePublicId: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string; // comma-separated dari form -> array di server
  ogImagePublicId: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  googleSiteVerification: string;
  bingVerification: string;
  facebookDomainVerification: string;
  mapsQuery: string;
};

export type SaveSettingsResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// Pengaturan situs hanya boleh diubah oleh peran admin (lihat matriks hak akses).
async function assertAdmin(): Promise<boolean> {
  const actor = await getAdminActor();
  return actor !== null;
}

// String kosong -> null; selain itu trim.
const seoTitleField = z
  .string()
  .trim()
  .max(120, "Judul SEO maksimal 120 karakter")
  .transform((s) => (s === "" ? null : s));

const seoDescriptionField = z
  .string()
  .trim()
  .max(200, "Deskripsi SEO maksimal 200 karakter")
  .transform((s) => (s === "" ? null : s));

// URL publik: kosong -> null, selain itu harus http/https.
const httpUrl = z
  .string()
  .trim()
  .refine(
    (s) => s === "" || /^https?:\/\/\S+$/i.test(s),
    "Gunakan alamat yang diawali http:// atau https://."
  )
  .refine(
    (s) => s === "" || s.length <= 300,
    "Alamat maksimal 300 karakter."
  )
  .transform((s) => (s === "" ? null : s));

// publicId Cloudinary: hanya karakter aman.
const publicIdField = z
  .string()
  .trim()
  .refine(
    (s) => s === "" || /^[A-Za-z0-9._\-/]+$/.test(s),
    "Penanda gambar tidak valid."
  )
  .refine((s) => s === "" || s.length <= 200, "Penanda gambar terlalu panjang.")
  .transform((s) => (s === "" ? null : s));

// Token verifikasi: alfanumerik + _ - (aman untuk atribut content).
const verifyToken = z
  .string()
  .trim()
  .refine(
    (s) => s === "" || /^[A-Za-z0-9_-]{1,120}$/.test(s),
    "Token hanya boleh berisi huruf, angka, strip, dan garis bawah."
  )
  .transform((s) => (s === "" ? null : s));

// ID Google Analytics 4 (G-XXXXXXXXXX).
const gaIdField = z
  .string()
  .trim()
  .transform((s) => (s === "" ? "" : s.toUpperCase()))
  .refine(
    (s) => s === "" || /^G-[A-Z0-9]{4,12}$/.test(s),
    "Format GA4 tidak valid (contoh: G-ABC12D3E4F)."
  )
  .transform((s) => (s === "" ? null : s));

// ID Google Tag Manager (GTM-XXXXXX).
const gtmIdField = z
  .string()
  .trim()
  .transform((s) => (s === "" ? "" : s.toUpperCase()))
  .refine(
    (s) => s === "" || /^GTM-[A-Z0-9]{4,10}$/.test(s),
    "Format Tag Manager tidak valid (contoh: GTM-ABC123)."
  )
  .transform((s) => (s === "" ? null : s));

// ID Meta Pixel (digit saja).
const pixelIdField = z
  .string()
  .trim()
  .refine(
    (s) => s === "" || /^[0-9]{6,20}$/.test(s),
    "ID Meta Pixel harus berupa 6-20 digit."
  )
  .transform((s) => (s === "" ? null : s));

// Daftar keyword: ubah string comma-separated menjadi array bersih (maks 20).
const keywordsField = z
  .string()
  .transform((s) =>
    s
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .slice(0, 20)
  )
  .transform((arr) => (arr.length === 0 ? null : arr));

// Kueri peta: teks alamat/tempat. Karakter < > dibuang (tak pernah ada di alamat;
// pembelaan berlapis meski URL embed selalu di-encode). Maks 300 karakter.
const mapsQueryField = z
  .string()
  .trim()
  .transform((s) => s.replace(/[<>]/g, ""))
  .refine((s) => s.length <= 300, "Kueri peta maksimal 300 karakter.")
  .transform((s) => (s === "" ? null : s));

const settingsSchema = z.object({
  clinicName: z
    .string()
    .trim()
    .min(1, "Nama klinik wajib diisi")
    .max(120, "Nama klinik maksimal 120 karakter"),
  addressText: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi")
    .max(300, "Alamat maksimal 300 karakter"),
  hoursText: z
    .string()
    .trim()
    .min(1, "Jam operasional wajib diisi")
    .max(200, "Jam operasional maksimal 200 karakter"),
  whatsappNumber: z
    .string()
    .transform((s) => s.replace(/\D/g, ""))
    .pipe(
      z.string().regex(/^[0-9]{8,15}$/, {
        message:
          "Nomor WhatsApp harus 8-15 digit, format internasional tanpa tanda + (mis. 6281234567890).",
      })
    ),
  faviconPublicId: publicIdField,
  logoPublicId: publicIdField,
  heroImagePublicId: publicIdField,
  seoTitle: seoTitleField,
  seoDescription: seoDescriptionField,
  seoKeywords: keywordsField,
  ogImagePublicId: publicIdField,
  instagramUrl: httpUrl,
  facebookUrl: httpUrl,
  tiktokUrl: httpUrl,
  youtubeUrl: httpUrl,
  googleAnalyticsId: gaIdField,
  googleTagManagerId: gtmIdField,
  metaPixelId: pixelIdField,
  googleSiteVerification: verifyToken,
  bingVerification: verifyToken,
  facebookDomainVerification: verifyToken,
  mapsQuery: mapsQueryField,
});

export async function saveSettings(
  input: SiteSettingsInput
): Promise<SaveSettingsResult> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Tidak berwenang." };
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Mohon periksa isian formulir.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await db
      .insert(siteSettings)
      .values({ id: 1, ...data })
      .onConflictDoUpdate({ target: siteSettings.id, set: data });

    updateTag("content");
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menyimpan pengaturan situs." };
  }
}
