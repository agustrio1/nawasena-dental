"use server";

import { updateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/auth";
import { db } from "@/db";
import { faqs } from "@/db/schema";

export type FaqInput = {
  id?: string | null;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

export type SaveFaqResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type ActionResult = { ok: boolean; error?: string };

async function assertAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

const faqSchema = z.object({
  id: z.string().uuid().nullish(),
  question: z
    .string()
    .trim()
    .min(1, "Pertanyaan wajib diisi")
    .max(200, "Pertanyaan maksimal 200 karakter"),
  answer: z
    .string()
    .trim()
    .min(1, "Jawaban wajib diisi")
    .max(2000, "Jawaban maksimal 2000 karakter"),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export async function saveFaq(input: FaqInput): Promise<SaveFaqResult> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Tidak berwenang." };
  }

  const parsed = faqSchema.safeParse(input);
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
  const values = {
    question: data.question,
    answer: data.answer,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
  };

  try {
    if (data.id) {
      await db.update(faqs).set(values).where(eq(faqs.id, data.id));
      updateTag("content");
      return { ok: true, id: data.id };
    }

    const [inserted] = await db
      .insert(faqs)
      .values(values)
      .returning({ id: faqs.id });

    updateTag("content");
    return { ok: true, id: inserted.id };
  } catch {
    return { ok: false, error: "Gagal menyimpan FAQ." };
  }
}

export async function setFaqActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  await db
    .update(faqs)
    .set({ isActive })
    .where(eq(faqs.id, idResult.data));

  updateTag("content");
  return { ok: true };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { ok: false, error: "Tidak berwenang." };

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { ok: false, error: "Data tidak valid." };

  await db.delete(faqs).where(eq(faqs.id, idResult.data));

  updateTag("content");
  return { ok: true };
}
