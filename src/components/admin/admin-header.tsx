"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  CircleUser,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/cn";

export type AdminUser = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

type Crumb = { label: string; href?: string };

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === "/admin") return [{ label: "Dashboard" }];

  const section = ADMIN_NAV.filter(
    (n) => n.href !== "/admin" && pathname.startsWith(n.href)
  ).sort((a, b) => b.href.length - a.href.length)[0];

  const crumbs: Crumb[] = [{ label: "Admin", href: "/admin" }];
  if (!section) return crumbs;

  const rest = pathname.slice(section.href.length).split("/").filter(Boolean);
  const tail = rest.includes("new")
    ? "Baru"
    : rest.includes("edit")
      ? "Edit"
      : null;

  crumbs.push({ label: section.label, href: tail ? section.href : undefined });
  if (tail) crumbs.push({ label: tail });
  return crumbs;
}

function roleLabel(role?: string): string {
  if (role === "admin") return "Administrator";
  if (role === "editor") return "Editor";
  return "Pengguna";
}

const profileHref = ADMIN_NAV.find((n) => n.icon === "circle-user")?.href;

const menuItem =
  "flex h-8 cursor-pointer select-none items-center gap-2 rounded-md px-2 text-sm text-charcoal/80 outline-none transition-colors data-[highlighted]:bg-sage/60 data-[highlighted]:text-forest";

export function AdminHeader({
  onOpenCommand,
  onOpenMenu,
  user,
}: {
  onOpenCommand: () => void;
  // Opsional: bila diberikan, tombol menu tampil di HP (di bawah breakpoint md).
  onOpenMenu?: () => void;
  user?: AdminUser;
}) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  const displayName = user?.name?.trim() || user?.email || "Akun saya";
  const initial = displayName.charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur supports-backdrop-filter:bg-white/75 md:px-6">
      {onOpenMenu && (
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka menu"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-charcoal/70 transition-colors hover:bg-sage/50 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest md:hidden"
        >
          <Menu aria-hidden="true" className="size-4" />
        </button>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li
                key={`${crumb.label}-${index}`}
                className={cn(
                  "min-w-0 items-center gap-1.5",
                  last ? "flex" : "hidden sm:flex"
                )}
              >
                {last ? (
                  <span
                    aria-current="page"
                    className="truncate font-medium text-forest"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href ?? "/admin"}
                      className="text-charcoal/60 transition-colors hover:text-forest"
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-charcoal/35"
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Pencarian */}
      <button
        type="button"
        onClick={onOpenCommand}
        aria-label="Cari menu atau konten"
        className="inline-flex size-9 shrink-0 items-center justify-center gap-2 rounded-md border border-line bg-white text-sm text-charcoal/55 shadow-sm transition-colors hover:bg-sage/30 hover:text-charcoal/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest sm:w-64 sm:justify-start sm:px-3"
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden truncate sm:inline">Cari menu atau konten…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-line bg-ivory px-1.5 py-0.5 font-mono text-[11px] text-charcoal/55 sm:inline">
          Ctrl K
        </kbd>
      </button>

      {/* Menu akun */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Menu akun"
            className="flex h-9 shrink-0 items-center gap-2 rounded-md pl-1 pr-1 transition-colors hover:bg-sage/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest md:pr-2"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-forest text-xs font-semibold text-ivory">
              {initial}
            </span>
            <span className="hidden min-w-0 max-w-36 text-left leading-tight md:grid">
              <span className="truncate text-sm font-medium text-forest">
                {displayName}
              </span>
              <span className="truncate text-[11px] text-charcoal/55">
                {roleLabel(user?.role)}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="hidden size-4 text-charcoal/50 md:block"
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 w-60 rounded-lg border border-line bg-white p-1 shadow-lg"
          >
            <div className="px-2 py-2">
              <p className="truncate text-sm font-medium text-forest">
                {displayName}
              </p>
              {user?.email && user.email !== displayName && (
                <p className="truncate text-xs text-charcoal/55">{user.email}</p>
              )}
              <p className="mt-1 inline-flex rounded-full bg-sage px-2 py-0.5 text-[11px] font-medium text-forest">
                {roleLabel(user?.role)}
              </p>
            </div>

            <DropdownMenu.Separator className="my-1 h-px bg-line" />

            {profileHref && (
              <DropdownMenu.Item asChild>
                <Link href={profileHref} className={menuItem}>
                  <CircleUser aria-hidden="true" className="size-4" />
                  Profil Saya
                </Link>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item
              className={cn(
                menuItem,
                "text-error data-highlighted:bg-error/5 data-highlighted:text-error"
              )}
              onSelect={() => {
                void signOut({ callbackUrl: "/admin/login" });
              }}
            >
              <LogOut aria-hidden="true" className="size-4" />
              Keluar
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}