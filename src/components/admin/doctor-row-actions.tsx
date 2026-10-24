"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import {
  deleteDoctor,
  setDoctorStatus,
} from "@/lib/actions/admin-doctors";

export function DoctorRowActions({
  id,
  status,
}: {
  id: string;
  status: string;
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

  const published = status === "published";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          run(() => setDoctorStatus(id, published ? "draft" : "published"))
        }
      >
        {published ? "Jadi draf" : "Terbitkan"}
      </Button>

      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/doctors/${id}/edit`}>Edit</Link>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-error hover:bg-error/5"
        onClick={() => {
          if (
            window.confirm("Hapus dokter ini? Tindakan tidak bisa dibatalkan.")
          ) {
            void run(() => deleteDoctor(id));
          }
        }}
      >
        Hapus
      </Button>
    </div>
  );
}
