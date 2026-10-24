import "server-only";

import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let configured = false;
function ensureConfig() {
  if (configured) return;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Konfigurasi Cloudinary tidak lengkap (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)."
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export type UploadResult = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
};

// Bentuk minimal respons Cloudinary yang kita perlukan.
type CldResponse = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
};

// Unggah satu gambar ke Cloudinary lewat API bertanda tangan (secret hanya di server).
export async function uploadImage(file: File): Promise<UploadResult> {
  ensureConfig();

  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("Tipe file tidak didukung. Pakai JPEG, PNG, WebP, AVIF, atau GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Ukuran gambar melebihi 8 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<CldResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "nawasena/admin",
        resource_type: "image",
        overwrite: false,
      },
      (error, uploaded) => {
        if (error || !uploaded) {
          reject(error ?? new Error("Upload gagal."));
          return;
        }
        resolve(uploaded as CldResponse);
      }
    );
    stream.end(buffer);
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width ?? 0,
    height: result.height ?? 0,
  };
}

// Hapus aset gambar dari Cloudinary berdasarkan publicId.
// Dipakai Pustaka Media (khusus admin). Gagal senyap bila aset sudah hilang.
export async function destroyImage(publicId: string): Promise<void> {
  ensureConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
