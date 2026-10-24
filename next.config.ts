import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Default Next.js membatasi body Server Action 1MB. Upload gambar lewat
      // admin memakai Server Action, jadi dinaikkan ke 8MB agar selaras dengan
      // batas MAX_BYTES di cloudinary-admin.ts (dan aman untuk multipart).
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
