import type { Metadata } from "next";

import { getSessionActor } from "@/lib/admin-authz";
import { listMediaAssets } from "@/lib/admin-data";
import { MediaLibrary } from "@/components/admin/media-library";

export const instant = false;

export const metadata: Metadata = {
  title: "Pustaka Media",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  // Semua yang login boleh melihat; hanya admin yang boleh menghapus
  // (ditangani di action & prop canDelete).
  const actor = await getSessionActor();
  const items = await listMediaAssets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-forest">Pustaka Media</h1>
        <p className="mt-1 text-sm text-charcoal/65">
          {items.length} aset gambar. Gambar yang disimpan lewat form muncul di
          sini dan dapat dipilih ulang melalui tombol &ldquo;Pustaka&rdquo; pada
          field gambar.
        </p>
      </div>

      <MediaLibrary items={items} canDelete={actor?.role === "admin"} />
    </div>
  );
}
