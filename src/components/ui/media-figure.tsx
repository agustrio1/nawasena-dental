import "server-only";

import { SiteImage } from "@/components/ui/site-image";
import { cn } from "@/lib/cn";

// Menggambar gambar Cloudinary bila publicId tersedia; jika belum ada aset,
// tampilkan blok netral (bukan foto palsu): latar sage + ikon garis (layanan)
// atau inisial (dokter). className dipakai bersama untuk gambar & fallback
// (atur aspect, lebar, dan radius di pemanggil).
export function MediaFigure({
  publicId,
  alt,
  width = 800,
  height = 600,
  className,
  fallback = "tooth",
  initials,
  priority = false,
  objectFit = "cover",
}: {
  publicId: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: "tooth" | "person";
  initials?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain";
}) {
  if (publicId) {
    return (
      <SiteImage
        publicId={publicId}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        objectFit={objectFit}
        className={cn(
          objectFit === "contain"
            ? "h-auto w-full"
            : "h-full w-full object-cover",
          className
        )}
      />
    );
  }

  if (fallback === "person") {
    return (
      <div
        aria-hidden
        className={cn(
          "flex items-center justify-center bg-sage",
          className
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest font-serif text-xl text-ivory">
          {initials ?? "?"}
        </span>
      </div>
    );
  }

  // Fallback layanan: siluet gigi garis, halus, tanpa klaim visual palsu.
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center bg-sage text-forest/30",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10"
      >
        <path d="M12 4.5c-1.9 0-2.6 1.1-4.2 1.1S5 4.7 5 7.4c0 2.8 1.1 4.9 1.8 7.6.4 1.6.6 4.5 1.8 4.5s1-2.7 1.4-4.2c.3-1.2.6-1.8 1.2-1.8s.9.6 1.2 1.8c.4 1.5.6 4.2 1.4 4.2s1.4-2.9 1.8-4.5C20 12.3 21 10.2 21 7.4c0-2.7-1-2.9-2.8-2.9S13.9 4.5 12 4.5Z" />
      </svg>
    </div>
  );
}
