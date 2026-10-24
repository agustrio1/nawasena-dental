"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { saveUser, type UserInput } from "@/lib/actions/admin-users";
import type { AdminUserEdit } from "@/lib/admin-data";

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

const selectClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-forest";

export function UserForm({
  initial,
  mode,
  isSelf,
}: {
  initial?: AdminUserEdit;
  mode: "create" | "edit";
  isSelf?: boolean;
}) {
  const router = useRouter();

  const [name, setName] = React.useState(initial?.name ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [role, setRole] = React.useState<string>(initial?.role ?? "editor");
  const [password, setPassword] = React.useState("");

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

    const payload: UserInput = {
      id: initial?.id ?? null,
      name: name.trim(),
      email: email.trim(),
      role,
      password: password.trim() !== "" ? password.trim() : null,
    };

    const result = await saveUser(payload);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-forest">
          {mode === "create" ? "Pengguna Baru" : "Edit Pengguna"}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/users")}
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

      <Field label="Nama" error={fieldErrors.name}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. dr. Nawasena"
        />
      </Field>

      <Field label="Email" hint="Dipakai untuk masuk ke panel admin." error={fieldErrors.email}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@klinik.example"
        />
      </Field>

      <Field
        label="Role"
        hint={
          isSelf
            ? "Anda tidak dapat menurunkan role akun sendiri."
            : "Admin dapat mengelola pengguna; Editor mengelola konten."
        }
        error={fieldErrors.role}
      >
        <select
          className={selectClass}
          value={role}
          disabled={isSelf}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
      </Field>

      <Field
        label={mode === "create" ? "Password" : "Password baru (opsional)"}
        hint={
          mode === "create"
            ? "Minimal 8 karakter."
            : "Kosongkan bila tidak ingin mengganti password."
        }
        error={fieldErrors.password}
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "create" ? "••••••••" : "Tetap seperti semula bila kosong"}
          autoComplete="new-password"
        />
      </Field>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/users")}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Pengguna"}
        </Button>
      </div>
    </form>
  );
}
