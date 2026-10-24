"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { deleteUser, setUserActive } from "@/lib/actions/admin-users";

export function UserRowActions({
  id,
  isSelf,
  isActive,
}: {
  id: string;
  isSelf: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    const result = await action();
    setPending(false);
    if (result.ok) router.refresh();
    else window.alert(result.error ?? "Gagal memproses.");
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/users/${id}/edit`}>Edit</Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending || (isSelf && isActive)}
        onClick={() => {
          if (isActive) {
            if (
              window.confirm(
                "Nonaktifkan akun ini? Pengguna tidak dapat masuk dan sesinya langsung berakhir."
              )
            ) {
              void run(() => setUserActive(id, false));
            }
          } else {
            void run(() => setUserActive(id, true));
          }
        }}
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </Button>

      {!isSelf && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          className="text-error hover:bg-error/5"
          onClick={() => {
            if (
              window.confirm("Hapus pengguna ini? Tindakan tidak bisa dibatalkan.")
            ) {
              void run(() => deleteUser(id));
            }
          }}
        >
          Hapus
        </Button>
      )}
    </div>
  );
}
