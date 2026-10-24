"use server";

import { updateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/db";
import { doctors, publishStatuses } from "@/db/schema";
import { upsertMediaAsset } from "@/lib/media-admin";

export type DoctorInput = {
  id?: string | null;
  name: string;
  specialty: string;
  education?: string | null;
  experience?: string | null;
  sortOrder: number;
  status: string;
  photo: {
    publicId: string;
    altText: string;
    width?: number;
    height?: number;
  } | null;
};

export type SaveDoctorResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type ActionResult = { ok: boolean; error?: string };

async function assertAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

const statusSchema = z.enum(publishStatuses);

const doctorSchema = z.object({
  id: z.string().uuid().nullish(),
  name: z.string().trim().min(1, "Nama dokter wajib diisi").max(120),
  specialty: z.string().trim().min(1, "Keahlian wajib diisi").max(120),
  education: z.string().trim().max(500).nullish(),
  experience: z.string().trim().max(500).nullish(),
  sortOrder: z.number().int().min(0),
  status: z.enum(publishStatuses),
  photo: z
    .object({
      publicId: z.string().trim(),
      altText: z.string().trim(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    })
    .nullable(),
});

export async function saveDoctor(
  input: DoctorInput
): Promise<SaveDoctorResult> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Tidak berwenang." };
  }

  const parsed = doctorSchema.safeParse(input);
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
  const photoMediaId = await upsertMediaAsset(data.photo);

  const values = {
    name: data.name,
    specialty: data.specialty,
    education: data.education || null,
    experience: data.experience || null,
    sortOrder: data.sortOrder,
    status: data.status,
    photoMediaId,
  };

  try {
    if (data.id) {
      await db.update(doctors).set(values).where(eq(doctors.id, data.id));
      updateTag("content");
      return { ok: true, id: data.id };
    }

    const [inserted] = await db
      .insert(doctors)
      .values(values)
      .returning({ id: doctors.id });

    updateTag("content");
    return { ok: true, id: inserted.id };
  } catch {
    return { ok: false, error: "Gagal menyimpan data dokter." };
  }
}

export async function setDoctorStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  const statusResult = statusSchema.safeParse(status);
  if (!idResult.success || !statusResult.success) {
    return { ok: false, error: "Data tidak valid." };
  }

  await db
    .update(doctors)
    .set({ status: statusResult.data })
    .where(eq(doctors.id, idResult.data));

  updateTag("content");
  return { ok: true };
}

export async function deleteDoctor(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  await db.delete(doctors).where(eq(doctors.id, idResult.data));

  updateTag("content");
  return { ok: true };
}
