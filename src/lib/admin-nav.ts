export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  // Bila true, entri hanya tampil/tercari untuk peran admin.
  requiresAdmin?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard" },
  { label: "Permintaan Janji", href: "/admin/appointments", icon: "calendar-check" },
  { label: "Layanan", href: "/admin/services", icon: "stethoscope" },
  { label: "Artikel", href: "/admin/articles", icon: "file-text" },
  { label: "Kategori", href: "/admin/categories", icon: "folder" },
  { label: "Dokter", href: "/admin/doctors", icon: "users" },
  { label: "Galeri", href: "/admin/gallery", icon: "image" },
  { label: "FAQ", href: "/admin/faqs", icon: "help-circle" },
  { label: "Pustaka Media", href: "/admin/media", icon: "images" },
  { label: "Pengguna", href: "/admin/users", icon: "user-cog", requiresAdmin: true },
  { label: "Pengaturan", href: "/admin/settings", icon: "settings", requiresAdmin: true },
  { label: "Profil Saya", href: "/admin/profile", icon: "circle-user" },
];
