"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { AdminCommand, type SearchItem } from "./admin-command";
import { AdminHeader, type AdminUser } from "./admin-header";
import {
  AdminSidebar,
  SidebarContent,
  type AdminBrand,
} from "./admin-sidebar";

export function AdminShell({
  children,
  searchItems,
  isAdmin = true,
  brand,
  user,
}: {
  children: React.ReactNode;
  searchItems: SearchItem[];
  isAdmin?: boolean;
  brand?: AdminBrand;
  user?: AdminUser;
}) {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Pintasan Ctrl/⌘ + K untuk command palette.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Tutup drawer otomatis saat layar dilebarkan ke ukuran desktop.
  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="min-h-screen bg-ivory">
      <AdminSidebar isAdmin={isAdmin} brand={brand} />

      {/* Drawer menu (HP) */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-charcoal/40 md:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-line bg-white shadow-xl focus:outline-none md:hidden"
          >
            <Dialog.Title className="sr-only">Menu navigasi</Dialog.Title>
            <SidebarContent
              isAdmin={isAdmin}
              brand={brand}
              onNavigate={() => setMenuOpen(false)}
            />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Tutup menu"
                className="absolute right-2 top-3 inline-flex size-8 items-center justify-center rounded-md text-charcoal/60 transition-colors hover:bg-sage/50 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-h-screen min-w-0 flex-col md:pl-60">
        <AdminHeader
          onOpenCommand={() => setCommandOpen(true)}
          onOpenMenu={() => setMenuOpen(true)}
          user={user}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      <AdminCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        items={searchItems}
      />
    </div>
  );
}