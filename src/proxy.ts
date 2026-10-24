import { withAuth } from "next-auth/middleware";

// Next.js 16 mengganti konvensi middleware.ts menjadi proxy.ts.
// next-auth v4: lindungi seluruh rute /admin/*, kecuali halaman login
// (pages.signIn) yang otomatis diizinkan.
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  matcher: ["/admin/:path*"],
};
