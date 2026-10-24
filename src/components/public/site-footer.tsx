import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { Container } from "@/components/ui/container";
import { buildWhatsAppUrl } from "@/lib/appointment";
import { getSiteSettings, type SiteSettingsContent } from "@/lib/content";
import { NAV_ITEMS } from "@/lib/nav";

// Ikon sosial (monokrom, currentColor). Hanya dirender bila URL-nya diisi.
const SOCIAL_ICONS: Record<
  "instagram" | "facebook" | "tiktok" | "youtube",
  { label: string; path: string }
> = {
  instagram: {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.4.5.2.9.5 1.3.9.4.4.7.8.9 1.3.15.4.35 1 .4 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.4 2.2-.2.5-.5.9-.9 1.3-.4.4-.8.7-1.3.9-.4.15-1 .35-2.2.4-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.4a3.6 3.6 0 0 1-1.3-.9 3.6 3.6 0 0 1-.9-1.3c-.15-.4-.35-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.4-2.2.2-.5.5-.9.9-1.3.4-.4.8-.7 1.3-.9.4-.15 1-.35 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.3A6.5 6.5 0 1 0 18.5 12 6.5 6.5 0 0 0 12 5.5Zm0 10.7A4.2 4.2 0 1 1 16.2 12 4.2 4.2 0 0 1 12 16.2Zm6.7-10.9a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z",
  },
  facebook: {
    label: "Facebook",
    path: "M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.3H8v2.8h2.4V21h3.1Z",
  },
  tiktok: {
    label: "TikTok",
    path: "M16.5 5.8a4.3 4.3 0 0 1-2.4-1.5 4.3 4.3 0 0 1-.9-2.6h-3v12.2a2.4 2.4 0 1 1-1.7-2.3V8.4a5.5 5.5 0 1 0 4.7 5.4V9.3a7.2 7.2 0 0 0 4.2 1.3V7.7a4.3 4.3 0 0 1-.9-.2Z",
  },
  youtube: {
    label: "YouTube",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 14.6V9.4l4.4 2.6Z",
  },
};

function SocialLinks({ settings }: { settings: SiteSettingsContent }) {
  const entries = (
    [
      ["instagram", settings.instagramUrl],
      ["facebook", settings.facebookUrl],
      ["tiktok", settings.tiktokUrl],
      ["youtube", settings.youtubeUrl],
    ] as const
  ).filter(([, url]) => !!url);

  if (entries.length === 0) return null;

  return (
    <li className="pt-1">
      <span className="text-ivory/60">Ikuti kami:</span>
      <ul className="mt-2 flex gap-2">
        {entries.map(([key, url]) => (
          <li key={key}>
            <a
              href={url as string}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={SOCIAL_ICONS[key].label}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ivory/25 text-ivory/85 transition-colors hover:border-ivory/60 hover:text-ivory"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d={SOCIAL_ICONS[key].path} />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}


// Tahun hak cipta dihitung saat request (connection) dan dialirkan lewat
// Suspense, sehingga sisa rute tetap dapat di-prerender tanpa memblokir.
async function CopyrightYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const waHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Halo, saya ingin bertanya mengenai layanan konsultasi gigi dan jadwal kunjungan."
  );

  return (
    <footer className="on-forest border-t border-line bg-forest text-ivory">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_0.7fr_0.8fr] md:py-14">
        <div>
          <p className="text-small font-medium uppercase tracking-[0.12em] text-ivory/70">
            {settings.clinicName}
          </p>
          <h2 className="mt-3 max-w-[16ch] font-serif text-h3 text-ivory">
            Modern dentistry, thoughtful care.
          </h2>
          <p className="mt-4 max-w-prose text-ivory/80">
            Klinik gigi yang mengutamakan pemeriksaan teliti, penjelasan yang
            mudah dipahami, dan rencana perawatan yang disesuaikan dengan
            kebutuhan pasien.
          </p>
        </div>

        <div>
          <h3 className="text-small font-medium uppercase tracking-[0.12em] text-ivory/70">
            Navigasi
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-ivory/85">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-ivory"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-small font-medium uppercase tracking-[0.12em] text-ivory/70">
            Kontak
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/85">
            <li>
              <span className="text-ivory/60">Alamat (demo):</span>
              <br />
              {settings.addressText}
            </li>
            <li>
              <span className="text-ivory/60">Jam praktik (demo):</span>
              <br />
              {settings.hoursText}
            </li>
            <li>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ivory underline underline-offset-4 hover:text-ivory/80"
              >
                Chat WhatsApp
              </a>
            </li>
            <SocialLinks settings={settings} />
          </ul>
        </div>
      </Container>

      <div className="border-t border-ivory/15">
        <Container className="flex flex-col gap-3 py-6 text-sm text-ivory/70 md:flex-row md:items-center md:justify-between">
          <p>
            © <Suspense fallback={"\u2026"}><CopyrightYear /></Suspense>{" "}
            {settings.clinicName} — situs demo portofolio. Seluruh data bersifat
            fiktif.
          </p>
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-ivory"
          >
            Kebijakan Privasi
          </Link>
        </Container>
      </div>
    </footer>
  );
}
