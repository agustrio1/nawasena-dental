import "server-only";

export type CloudinaryImageOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "pad" | "limit";
  quality?: "auto" | number;
  format?: "auto" | "jpg" | "webp" | "png";
  dpr?: number;
  gravity?: string;
  // Effect Cloudinary mentah (tanpa prefiks `e_`), mis. "background_remove".
  effect?: string;
  // Warna latar untuk area transparan (tanpa prefiks `b_`), mis. "rgb:F8F7F3".
  background?: string;
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryImageOptions = {}
) {
  if (!publicId) return "";
  if (!cloudName) return publicId.startsWith("http") ? publicId : "";

  // Sintaks transformasi Cloudinary: key_value dipisah koma (bukan query
  // string `key=value&`). URLSearchParams menghasilkan `f=auto&q=auto&...`
  // yang ditolak Cloudinary (HTTP 400), jadi susun manual dengan underscore.
  const parts: string[] = [
    `f_${options.format ?? "auto"}`,
    `q_${options.quality ?? "auto"}`,
    `c_${options.crop ?? "limit"}`,
  ];
  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.dpr) parts.push(`dpr_${options.dpr}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.effect) parts.push(`e_${options.effect}`);
  if (options.background) parts.push(`b_${options.background}`);

  const transform = parts.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform ? `${transform}/` : ""}${publicId}`;
}

export function buildCloudinaryImage(
  publicId: string,
  options: CloudinaryImageOptions = {}
) {
  return {
    src: buildCloudinaryUrl(publicId, options),
    width: options.width ?? 1200,
    height: options.height ?? 800,
  };
}
