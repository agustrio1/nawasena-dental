"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import {
  ImageUploadField,
  type ImageValue,
} from "@/components/admin/image-upload-field";
import {
  changeOwnPassword,
  saveOwnProfile,
} from "@/lib/actions/admin-profile";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-forest">{label}</span>
      {hint && <span className="block text-xs text-charcoal/55">{hint}</span>}
      {children}
    </label>
  );
}

export function ProfileForm({
  initialName,
  email,
  role,
  initialImage,
}: {
  initialName: string;
  email: string;
  role: string;
  initialImage: string | null;
}) {
  const router = useRouter();

  const [name, setName] = React.useState(initialName);
  const [avatar, setAvatar] = React.useState<ImageValue | null>(
    initialImage
      ? { publicId: initialImage, altText: initialName, width: 0, height: 0 }
      : null
  );
  const [profilePending, setProfilePending] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<{
    tone: "ok" | "error";
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [pwPending, setPwPending] = React.useState(false);
  const [pwMsg, setPwMsg] = React.useState<{
    tone: "ok" | "error";
    text: string;
  } | null>(null);

  async function submitProfile(event: React.FormEvent) {
    event.preventDefault();
    setProfilePending(true);
    setProfileMsg(null);
    const result = await saveOwnProfile({
      name: name.trim(),
      image: avatar?.publicId ?? null,
    });
    setProfilePending(false);
    if (!result.ok) {
      setProfileMsg({ tone: "error", text: result.error ?? "Gagal menyimpan." });
      return;
    }
    setProfileMsg({ tone: "ok", text: "Profil tersimpan." });
    router.refresh();
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    setPwPending(true);
    setPwMsg(null);
    const result = await changeOwnPassword({
      currentPassword,
      newPassword,
    });
    setPwPending(false);
    if (!result.ok) {
      setPwMsg({ tone: "error", text: result.error ?? "Gagal mengganti password." });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setPwMsg({ tone: "ok", text: "Password berhasil diperbarui." });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-forest">Profil Saya</h1>
        <p className="mt-1 text-sm text-charcoal/65">
          Perbarui nama, foto, dan password akun Anda sendiri.
        </p>
      </div>

      <form
        onSubmit={submitProfile}
        className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold tracking-wide text-forest">
          Informasi akun
        </h2>

        {profileMsg && (
          <p
            className={
              profileMsg.tone === "ok"
                ? "rounded-lg border border-forest/30 bg-sage/40 px-3 py-2 text-sm text-forest"
                : "rounded-lg border border-error/40 bg-error/5 px-3 py-2 text-sm text-error"
            }
          >
            {profileMsg.text}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" hint="Tidak dapat diubah dari halaman ini.">
            <Input value={email} readOnly disabled />
          </Field>
          <Field label="Role" hint="Role diatur oleh admin.">
            <Input value={role} readOnly disabled className="capitalize" />
          </Field>
        </div>

        <Field label="Nama">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. dr. Nawasena"
          />
        </Field>

        <ImageUploadField
          label="Foto profil"
          value={avatar}
          onChange={setAvatar}
        />

        <div className="flex justify-end border-t border-line pt-4">
          <Button type="submit" disabled={profilePending}>
            {profilePending ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </div>
      </form>

      <form
        onSubmit={submitPassword}
        className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold tracking-wide text-forest">
          Ganti password
        </h2>

        {pwMsg && (
          <p
            className={
              pwMsg.tone === "ok"
                ? "rounded-lg border border-forest/30 bg-sage/40 px-3 py-2 text-sm text-forest"
                : "rounded-lg border border-error/40 bg-error/5 px-3 py-2 text-sm text-error"
            }
          >
            {pwMsg.text}
          </p>
        )}

        <Field label="Password saat ini">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>

        <Field label="Password baru" hint="Minimal 8 karakter.">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>

        <div className="flex justify-end border-t border-line pt-4">
          <Button type="submit" disabled={pwPending}>
            {pwPending ? "Menyimpan..." : "Ganti Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
