"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appointmentRequests, services } from "@/db/schema";
import { buildWhatsAppUrl } from "@/lib/appointment";
import type { AppointmentState } from "@/lib/appointment-state";
import { getSiteSettings } from "@/lib/content";

const TIME_RANGES = ["pagi", "siang", "sore"] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Maksimal 100 karakter"),
  whatsapp: z
    .string()
    .regex(/^[0-9]{8,15}$/, "Nomor WhatsApp harus 8-15 digit angka"),
  serviceId: z.string().uuid().nullable(),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal yang valid")
    .refine(isNotPast, "Tanggal tidak boleh di masa lalu"),
  preferredTimeRange: z.enum(TIME_RANGES),
  note: z.string().trim().max(300, "Catatan maksimal 300 karakter"),
  consent: z.boolean().refine((v) => v, "Centang persetujuan untuk melanjutkan"),
});

function isNotPast(dateStr: string): boolean {
  const chosen = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(chosen.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return chosen >= today;
}

// Normalisasi nilai FormData sebelum divalidasi.
function readForm(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "").trim();
  return {
    name: String(formData.get("name") ?? "").trim(),
    // Simpan digit saja; sesuai constraint ^[0-9]{8,15}$ di schema.
    whatsapp: String(formData.get("whatsapp") ?? "").replace(/[^\d]/g, ""),
    serviceId: serviceId ? serviceId : null,
    preferredDate: String(formData.get("preferredDate") ?? "").trim(),
    preferredTimeRange: String(formData.get("preferredTimeRange") ?? "").trim(),
    note: String(formData.get("note") ?? "").trim(),
    consent: formData.get("consent") === "on",
  };
}

export async function requestAppointment(
  _prev: AppointmentState,
  formData: FormData
): Promise<AppointmentState> {
  const parsed = schema.safeParse(readForm(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Mohon periksa kembali isian formulir.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // Anti-spam sederhana: batasi frekuensi per nomor WhatsApp (24 jam terakhir).
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [countRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(appointmentRequests)
    .where(
      and(
        eq(appointmentRequests.whatsapp, data.whatsapp),
        gte(appointmentRequests.createdAt, since)
      )
    );

  if ((countRow?.c ?? 0) >= 3) {
    return {
      status: "error",
      message:
        "Terlalu banyak permintaan dari nomor ini dalam 24 jam. Silakan hubungi kami langsung melalui WhatsApp.",
    };
  }

  await db.insert(appointmentRequests).values({
    name: data.name,
    whatsapp: data.whatsapp,
    serviceId: data.serviceId,
    preferredDate: data.preferredDate,
    preferredTimeRange: data.preferredTimeRange,
    note: data.note ? data.note : null,
    consentAt: new Date(),
  });

  // Jalur A: bangun tautan WhatsApp ke klinik dengan pesan terisi otomatis.
  // Pesan HANYA memuat informasi non-sensitif (nama, layanan, tanggal, waktu).
  // Catatan bebas pengguna tidak disertakan ke URL untuk menghindari bocornya
  // informasi medis pribadi (§9); catatan tetap tersimpan di database.
  const settings = await getSiteSettings();

  let serviceName: string | null = null;
  if (data.serviceId) {
    const [svc] = await db
      .select({ name: services.name })
      .from(services)
      .where(eq(services.id, data.serviceId))
      .limit(1);
    serviceName = svc?.name ?? null;
  }

  const rangeLabel = data.preferredTimeRange; // pagi/siang/sore
  const message = [
    `Halo, saya ${data.name}.`,
    `Saya ingin mengajukan permintaan janji${serviceName ? ` untuk layanan ${serviceName}` : ""}.`,
    `Preferensi: ${data.preferredDate} (${rangeLabel}).`,
    `Mohon konfirmasi ketersediaan jadwal. Terima kasih.`,
  ].join("\n");

  const waUrl = buildWhatsAppUrl(settings.whatsappNumber, message);

  return {
    status: "ok",
    message:
      "Permintaan Anda telah diterima. Lanjutkan ke WhatsApp agar tim kami dapat mengonfirmasi jadwal.",
    waUrl,
  };
}
