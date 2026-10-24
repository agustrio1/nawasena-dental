import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminGalleryById } from "@/lib/admin-data";
import { GalleryForm } from "@/components/admin/gallery-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Gambar",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditGalleryPage({ params }: Props) {
  const { id } = await params;
  const gallery = await getAdminGalleryById(id);

  if (!gallery) notFound();

  return <GalleryForm mode="edit" initial={gallery} />;
}
