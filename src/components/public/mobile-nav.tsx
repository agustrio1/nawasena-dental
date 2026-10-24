"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Tutup menu otomatis setiap kali pindah halaman, termasuk lewat back/forward.
  // Disesuaikan saat render agar tidak memicu render berlapis dari effect.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Tutup dengan tombol Escape atau klik di luar menu.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-site border border-forest text-forest transition-colors hover:bg-sage focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <span aria-hidden className="relative block h-3.5 w-5">
          <span
            className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 motion-reduce:transition-none ${
              open ? "top-1.5 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-current transition-all duration-300 motion-reduce:transition-none ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 motion-reduce:transition-none ${
              open ? "top-1.5 -rotate-45" : "top-3"
            }`}
          />
        </span>
      </button>

      <nav
        id="mobile-nav-panel"
        aria-label="Navigasi seluler"
        aria-hidden={!open}
        className={`absolute right-0 top-full mt-3 flex w-[min(20rem,calc(100vw-2.5rem))] origin-top-right flex-col gap-1 rounded-[1.25rem] border border-line bg-ivory p-2 transition-all duration-200 motion-reduce:transition-none ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1 scale-95 opacity-0"
        }`}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              tabIndex={open ? 0 : -1}
              className={`flex items-center justify-between rounded-site px-4 py-3 text-sm transition-colors ${
                active
                  ? "bg-sage font-medium text-forest"
                  : "text-charcoal hover:bg-sage hover:text-forest"
              }`}
            >
              {item.label}
              <span
                aria-hidden
                className={active ? "text-forest" : "text-charcoal/40"}
              >
                →
              </span>
            </Link>
          );
        })}

        <div className="mt-1 border-t border-line pt-2">
          <Link
            href="/kontak"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="flex items-center justify-center rounded-site bg-forest px-4 py-3 text-sm font-medium text-ivory transition-colors hover:bg-charcoal"
          >
            Buat Janji
          </Link>
        </div>
      </nav>
    </div>
  );
}