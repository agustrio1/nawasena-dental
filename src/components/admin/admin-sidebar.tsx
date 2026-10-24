"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CircleUser,
  ExternalLink,
  FileText,
  Folder,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  Settings,
  Stethoscope,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import { ADMIN_NAV } from "@/lib/admin-nav";
import { cloudinaryPreviewUrl } from "@/lib/cloudinary-client";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "calendar-check": CalendarCheck,
  stethoscope: Stethoscope,
  "file-text": FileText,
  folder: Folder,
  users: Users,
  image: ImageIcon,
  images: Images,
  "help-circle": HelpCircle,
  "user-cog": UserCog,
  "circle-user": CircleUser,
  settings: Settings,
};

export type AdminBrand = {
  name: string;
  // publicId Cloudinary (favicon, atau logo sebagai cadangan). null = pakai huruf.
  iconPublicId: string | null;
};

const DEFAULT_BRAND: AdminBrand = { name: "Nawasena", iconPublicId: null };

// Scrollbar tipis tanpa panah (menggantikan scrollbar klasik Windows).
const thinScroll =
  "[scrollbar-width:thin] [scrollbar-color:rgb(0_0_0/0.15)_transparent]";

function BrandMark({ brand }: { brand: AdminBrand }) {
  const [failed, setFailed] = React.useState(false);
  const src =
    brand.iconPublicId && !failed
      ? cloudinaryPreviewUrl(brand.iconPublicId, 96)
      : null;
  const initial = brand.name.trim().charAt(0).toUpperCase() || "N";

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-semibold",
        src ? "border border-line bg-white" : "bg-forest text-ivory"
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="size-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}

const itemBase =
  "group flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest";

// Dipakai oleh sidebar desktop dan (nanti) drawer menu di HP.
export function SidebarContent({
  isAdmin = true,
  brand = DEFAULT_BRAND,
  onNavigate,
}: {
  isAdmin?: boolean;
  brand?: AdminBrand;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const nav = ADMIN_NAV.filter((item) => !item.requiresAdmin || isAdmin);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand */}
      <div className="p-2">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-sage/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <BrandMark brand={brand} />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate font-serif text-sm font-semibold text-forest">
              {brand.name}
            </span>
            <span className="truncate text-xs text-charcoal/55">
              Panel Admin
            </span>
          </span>
        </Link>
      </div>

      {/* Menu */}
      <nav
        aria-label="Menu admin"
        className={cn("min-h-0 flex-1 overflow-y-auto px-2 pb-2", thinScroll)}
      >
        <p className="flex h-8 items-center px-2 text-xs font-medium text-charcoal/55">
          Menu
        </p>
        <ul className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const Icon = ICONS[item.icon];
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    itemBase,
                    active
                      ? "bg-sage font-medium text-forest"
                      : "text-charcoal/75 hover:bg-sage/50 hover:text-forest"
                  )}
                >
                  {Icon ? (
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-line p-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            itemBase,
            "text-charcoal/75 hover:bg-sage/50 hover:text-forest"
          )}
        >
          <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">Lihat situs</span>
        </Link>
        <p className="px-2 pb-1 pt-2 text-[11px] text-charcoal/45">
          Situs demo — data fiktif.
        </p>
      </div>
    </div>
  );
}

export function AdminSidebar({
  isAdmin = true,
  brand = DEFAULT_BRAND,
}: {
  isAdmin?: boolean;
  brand?: AdminBrand;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-white md:block">
      <SidebarContent isAdmin={isAdmin} brand={brand} />
    </aside>
  );
}