"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/admin/ui/button";
import { deleteFaq, setFaqActive } from "@/lib/actions/admin-faqs";

export function FaqRowActions({
  id,
  isActive,
}: {
  id: string;
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => run(() => setFaqActive(id, !isActive))}
      >
        {isActive ? "Sembunyikan" : "Tampilkan"}
      </Button>

      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/faqs/${id}/edit`}>Edit</Link>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-error hover:bg-error/5"
        onClick={() => {
          if (
            window.confirm("Hapus FAQ ini? Tindakan tidak bisa dibatalkan.")
          ) {
            void run(() => deleteFaq(id));
          }
        }}
      >
        Hapus
      </Button>
    </div>
  );
}
