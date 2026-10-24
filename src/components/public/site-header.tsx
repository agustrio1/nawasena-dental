import Link from "next/link";
import Image from "next/image";

import { MobileNav } from "./mobile-nav";
import { NAV_ITEMS } from "@/lib/nav";
import { getSiteSettings } from "@/lib/content";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest";

export async function SiteHeader() {
  const settings = await getSiteSettings();
  const clinicName = settings.clinicName || "Nawasena Dental Care";
  // Prioritas ikon: logo upload -> favicon upload -> huruf depan nama klinik.
  const logoId = settings.logoPublicId ?? settings.faviconPublicId ?? null;
  const initial = clinicName.trim().charAt(0).toUpperCase() || "N";
  const logoSrc = logoId
    ? buildCloudinaryUrl(logoId, {
        width: 88,
        height: 88,
        crop: "fill",
        gravity: "auto",
        format: "auto",
      })
    : "";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 backdrop-blur supports-backdrop-filter:bg-ivory/80">
      <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        <Link
          href="/"
          className={`flex min-w-0 items-center gap-3 text-charcoal ${focusRing}`}
          aria-label={`${clinicName} — beranda`}
        >
          {logoSrc ? (
            <Image
              src={logoSrc}
              width={44}
              height={44}
              alt=""
              aria-hidden
              priority
              className="h-11 w-11 shrink-0 rounded-site border border-line object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-site border border-forest bg-forest font-serif text-lg font-semibold text-ivory">
              {initial}
            </span>
          )}
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-serif text-base font-semibold text-forest md:text-lg">
              {clinicName}
            </span>
            <span className="hidden text-[0.72rem] text-charcoal/60 sm:block">
              Klinik gigi
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-7 text-sm text-charcoal md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative py-1 transition-colors hover:text-forest after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-forest after:transition-all after:duration-300 hover:after:w-full ${focusRing}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/kontak"
            className={`hidden items-center gap-2 rounded-site border border-forest bg-forest px-5 py-2.5 text-sm font-medium text-ivory transition-all duration-200 hover:-translate-y-0.5 hover:bg-charcoal md:inline-flex ${focusRing}`}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
              <path d="M8 3v4M16 3v4M3.5 10h17" />
            </svg>
            Buat Janji
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}