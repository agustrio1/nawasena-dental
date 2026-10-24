import type { Metadata } from "next";

import { GalleryForm } from "@/components/admin/gallery-form";

export const metadata: Metadata = {
  title: "Gambar Baru",
  robots: { index: false, follow: false },
};

export default function AdminNewGalleryPage() {
  return <GalleryForm mode="create" />;
}
