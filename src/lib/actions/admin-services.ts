"use server";

import { updateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/db";
import {
  publishStatuses,
  services,
} from "@/db/schema";
import { slugTakenByOther } from "@/lib/admin-data";
import { upsertMediaAsset } from "@/lib/media-admin";

export type ServiceInput = {
  id?: string | null;
  name: string;
  slug: string;
  summary: string;
  description: string;
  availabilityNote?: string | null;
  consultReasons: string[];
  processSteps: string[];
  faqs: { question: string; answer: string }[];
  sortOrder: number;
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  cover: {
    publicId: string;
    altText: string;
    width?: number;
    height?: number;
  } | null;
};

export type SaveServiceResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type ActionResult = { ok: boolean; error?: string };

async function assertAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const coverSchema = z
  .object({
    publicId: z.string().trim(),
    altText: z.string().trim(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .nullable();

const serviceSchema = z.object({
  id: z.string().uuid().nullish(),
  name: z.string().trim().min(1, "Nama layanan wajib diisi").max(120),
  slug: z.string().trim().max(160),
  summary: z
    .string()
    .trim()
    .min(1, "Ringkasan wajib diisi")
    .max(300, "Ringkasan maksimal 300 karakter"),
  description: z.string().trim().min(1, "Deskripsi wajib diisi"),
  availabilityNote: z.string().trim().max(300).nullish(),
  consultReasons: z.array(z.string().trim()).max(20),
  processSteps: z.array(z.string().trim()).max(20),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().max(200),
        answer: z.string().trim().max(1000),
      })
    )
    .max(20),
  sortOrder: z.number().int().min(0),
  status: z.enum(publishStatuses),
  seoTitle: z.string().trim().max(120).nullish(),
  seoDescription: z.string().trim().max(200).nullish(),
  cover: coverSchema,
});

// Naik-turunkan status dari daftar layanan.
const statusSchema = z.enum(publishStatuses);

export async function saveService(
  input: ServiceInput
): Promise<SaveServiceResult> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Tidak berwenang." };
  }

  const parsed = serviceSchema.safeParse(input);
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
  const finalSlug = data.slug !== "" ? slugify(data.slug) : slugify(data.name);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
    return {
      ok: false,
      error: "Slug tidak valid.",
      fieldErrors: { slug: "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung." },
    };
  }

  if (await slugTakenByOther(finalSlug, data.id ?? null)) {
    return {
      ok: false,
      error: "Slug sudah dipakai layanan lain.",
      fieldErrors: { slug: "Slug ini sudah digunakan." },
    };
  }

  // Buang item kosong dari array & pasangan FAQ tak lengkap.
  const consultReasons = data.consultReasons.filter((s) => s !== "");
  const processSteps = data.processSteps.filter((s) => s !== "");
  const faqs = data.faqs.filter(
    (f) => f.question !== "" && f.answer !== ""
  );

  const coverMediaId = await upsertMediaAsset(data.cover);

  const values = {
    slug: finalSlug,
    name: data.name,
    summary: data.summary,
    description: data.description,
    availabilityNote: data.availabilityNote || null,
    consultReasons,
    processSteps,
    faqs,
    sortOrder: data.sortOrder,
    status: data.status,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    coverMediaId,
  };

  try {
    if (data.id) {
      await db
        .update(services)
        .set(values)
        .where(eq(services.id, data.id));
      updateTag("content");
      return { ok: true, id: data.id };
    }

    const [inserted] = await db
      .insert(services)
      .values(values)
      .returning({ id: services.id });

    const id = inserted.id;
    updateTag("content");
    return { ok: true, id };
  } catch {
    // Unique violation atau error database lain.
    return {
      ok: false,
      error: "Gagal menyimpan. Periksa apakah slug unik.",
      fieldErrors: { slug: "Slug mungkin sudah digunakan." },
    };
  }
}

export async function setServiceStatus(
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
    .update(services)
    .set({ status: statusResult.data })
    .where(eq(services.id, idResult.data));

  // Site publik membaca layanan lewat cacheTag("content").
  updateTag("content");
  return { ok: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  // appointment_requests.service_id memakai onDelete "set null" → aman.
  await db.delete(services).where(eq(services.id, idResult.data));

  updateTag("content");
  return { ok: true };
}
