import type { Metadata } from "next";
import Link from "next/link";

import { listAllGallery } from "@/lib/admin-data";
import { GalleryRowActions } from "@/components/admin/gallery-row-actions";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { cloudinaryPreviewUrl } from "@/lib/cloudinary-client";
import { cn } from "@/lib/cn";

export const instant = false;

export const metadata: Metadata = {
  title: "Galeri",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const items = await listAllGallery();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-forest">Galeri Klinik</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            {items.length} gambar · menampilkan pengalaman &amp; fasilitas
            klinik.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/new">Gambar Baru</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-charcoal/60">
            Belum ada gambar. Klik &ldquo;Gambar Baru&rdquo; untuk mengunggah
            yang pertama.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-4/3 w-full border-b border-line bg-ivory/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryPreviewUrl(item.publicId, 600)}
                  alt={item.caption ?? "Gambar galeri"}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      item.isActive
                        ? "bg-forest text-ivory"
                        : "bg-sage text-forest"
                    )}
                  >
                    {item.isActive ? "Tampil" : "Sembunyi"}
                  </span>
                  <span className="text-xs text-charcoal/45">
                    Urutan {item.sortOrder}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-charcoal/75">
                  {item.caption ?? "(tanpa caption)"}
                </p>
                <GalleryRowActions id={item.id} isActive={item.isActive} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
