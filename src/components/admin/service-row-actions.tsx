"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import {
  deleteService,
  setServiceStatus,
} from "@/lib/actions/admin-services";

export function ServiceRowActions({
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
          run(() =>
            setServiceStatus(id, published ? "draft" : "published")
          )
        }
      >
        {published ? "Jadi draf" : "Terbitkan"}
      </Button>

      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/services/${id}/edit`}>Edit</Link>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-error hover:bg-error/5"
        onClick={() => {
          if (
            window.confirm(
              "Hapus layanan ini? Tindakan tidak bisa dibatalkan."
            )
          ) {
            void run(() => deleteService(id));
          }
        }}
      >
        Hapus
      </Button>
    </div>
  );
}
