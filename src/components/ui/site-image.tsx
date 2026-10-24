import "server-only";

import Image from "next/image";

import { buildCloudinaryUrl } from "@/lib/cloudinary";

// Merender gambar dari Cloudinary hanya bila publicId tersedia.
// Tanpa aset (mis. sebelum upload), komponen mengembalikan null sehingga
// tidak ada placeholder menyesatkan (§4).
export function SiteImage({
  publicId,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = "cover",
}: {
  publicId: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  // "cover" = penuhi bingkai (crop, default). "contain" = tampilkan gambar
  // utuh tanpa memotong (fit), cocok untuk banner yang diunggah pengguna.
  objectFit?: "cover" | "contain";
}) {
  if (!publicId) return null;

  const src = buildCloudinaryUrl(
    publicId,
    objectFit === "contain"
      ? { width, crop: "limit" }
      : { width, height, crop: "fill", gravity: "auto" }
  );

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
