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
  saveDoctor,
  type DoctorInput,
} from "@/lib/actions/admin-doctors";
import type { AdminDoctorEdit } from "@/lib/admin-data";

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

// Daftar keahlian (bidang) dokter. Nilai lama yang tidak ada di daftar ini
// tetap ikut muncul saat edit agar data dokter tidak berubah diam-diam.
const SPECIALTY_OPTIONS = [
  "Dokter Gigi Umum",
  "Ortodonti",
  "Periodonti",
  "Endodonti",
  "Konservasi Gigi",
  "Bedah Mulut",
  "Prostodonsia",
  "Kedokteran Gigi Anak",
  "Radiologi Kedokteran Gigi",
  "Penyakit Mulut",
];

export function DoctorForm({
  initial,
  mode,
}: {
  initial?: AdminDoctorEdit;
  mode: "create" | "edit";
}) {
  const router = useRouter();

  const [name, setName] = React.useState(initial?.name ?? "");
  const [specialty, setSpecialty] = React.useState(initial?.specialty ?? "");
  const [education, setEducation] = React.useState(initial?.education ?? "");
  const [experience, setExperience] = React.useState(
    initial?.experience ?? ""
  );
  const [sortOrder, setSortOrder] = React.useState(
    String(initial?.sortOrder ?? 0)
  );
  const [status, setStatus] = React.useState<string>(
    initial?.status ?? "draft"
  );
  const [photo, setPhoto] = React.useState<ImageValue | null>(
    initial?.photo
      ? {
          publicId: initial.photo.publicId,
          altText: initial.photo.altText,
          width: initial.photo.width,
          height: initial.photo.height,
        }
      : null
  );

  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const hasPhoto = photo !== null;

    const payload: DoctorInput = {
      id: initial?.id ?? null,
      name: name.trim(),
      specialty: specialty.trim(),
      education: education.trim() || null,
      experience: experience.trim() || null,
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
      status,
      photo: hasPhoto
        ? {
            publicId: photo.publicId,
            altText: photo.altText,
            width: photo.width,
            height: photo.height,
          }
        : null,
    };

    const result = await saveDoctor(payload);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    router.push("/admin/doctors");
    router.refresh();
  }

  // Sertakan nilai current bila kustom, agar edit dokter lama tidak mengubah data.
  const specialtyChoices =
    specialty && !SPECIALTY_OPTIONS.includes(specialty)
      ? [specialty, ...SPECIALTY_OPTIONS]
      : SPECIALTY_OPTIONS;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-forest">
          {mode === "create" ? "Dokter Baru" : "Edit Dokter"}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/doctors")}
          >
            Batal
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/5 px-3 py-2 text-sm text-error">
          {formError}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nama dokter" error={fieldErrors.name}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. dr. Nawasena Haning, Sp.RKG"
          />
        </Field>
        <Field label="Keahlian / bidang" error={fieldErrors.specialty}>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              Pilih keahlian…
            </option>
            {specialtyChoices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Pendidikan" hint="Opsional." error={fieldErrors.education}>
        <Textarea
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          rows={3}
        />
      </Field>

      <Field
        label="Pengalaman"
        hint="Opsional. Ringkasan non-klaimis."
        error={fieldErrors.experience}
      >
        <Textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          rows={3}
        />
      </Field>

      <ImageUploadField
        label="Foto profil"
        value={photo}
        onChange={setPhoto}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Urutan tampil">
          <Input
            inputMode="numeric"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <option value="draft">Draf</option>
            <option value="published">Terbit</option>
          </select>
        </Field>
        <div className="hidden md:block" />
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/doctors")}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan dokter"}
        </Button>
      </div>
    </form>
  );
}
