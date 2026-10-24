// Aman untuk client: hanya memakai cloud name publik, TANPA api key/secret.
// Dipakai komponen uploader untuk menampilkan pratinjau gambar.
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function cloudinaryPreviewUrl(
  publicId: string,
  width = 480
): string {
  if (!publicId) return "";
  if (!cloudName) return publicId.startsWith("http") ? publicId : "";
  const transform = `f_auto,q_auto,c_limit,w_${width}`;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}
