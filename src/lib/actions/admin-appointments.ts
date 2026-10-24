"use server";

import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/db";
import {
  appointmentRequests,
  appointmentStatuses,
} from "@/db/schema";

export type ActionResult = { ok: boolean; error?: string };

// Guard: aksi ini hanya untuk admin yang sudah login.
async function assertAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

const uuid = z.string().uuid();
const statusSchema = z.enum(appointmentStatuses);

export async function updateAppointmentStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = uuid.safeParse(id);
  const statusResult = statusSchema.safeParse(status);
  if (!idResult.success || !statusResult.success) {
    return { ok: false, error: "Data tidak valid." };
  }

  await db
    .update(appointmentRequests)
    .set({ status: statusResult.data })
    .where(eq(appointmentRequests.id, idResult.data));

  // Daftar dibaca fresh (request-time) di rute admin, jadi tidak ada cache
  // untuk di-invalidate; UI disegarkan lewat router.refresh() di komponen.
  return { ok: true };
}

// Tindak lanjut via WhatsApp: naikkan status otomatis 'baru' -> 'dihubungi'.
// Idempoten — bila status sudah 'dihubungi'/'selesai' tidak diubah.
export async function markAppointmentContacted(
  id: string
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = uuid.safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  const [row] = await db
    .select({ status: appointmentRequests.status })
    .from(appointmentRequests)
    .where(eq(appointmentRequests.id, idResult.data))
    .limit(1);

  if (!row) return { ok: false, error: "Permintaan tidak ditemukan." };

  if (row.status === "baru") {
    await db
      .update(appointmentRequests)
      .set({ status: "dihubungi" })
      .where(eq(appointmentRequests.id, idResult.data));
  }

  return { ok: true };
}

// Anonimisasi PII: nama → placeholder, whatsapp & note dihapus,
// anonymizedAt diisi. Baris tetap ada untuk statistik, tanpa data pribadi.
export async function anonymizeAppointment(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = uuid.safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  await db
    .update(appointmentRequests)
    .set({
      name: "[dianonimkan]",
      whatsapp: null,
      note: null,
      anonymizedAt: new Date(),
    })
    .where(eq(appointmentRequests.id, idResult.data));

  // Daftar dibaca fresh (request-time) di rute admin, jadi tidak ada cache
  // untuk di-invalidate; UI disegarkan lewat router.refresh() di komponen.
  return { ok: true };
}
