import type { Metadata } from "next";
import Script from "next/script";
import { Instrument_Sans, Newsreader } from "next/font/google";

import "./globals.css";
import { getSiteSettings } from "@/lib/content";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-newsreader",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// Deployment demo: noindex sampai dipakai untuk klien nyata
const noindex = process.env.SITE_NOINDEX === "true";

const DEFAULT_DESCRIPTION =
  "Pemeriksaan gigi yang teliti, penjelasan yang mudah dipahami, dan rencana perawatan yang disusun bersama. Situs demo Jadikan Web.";
const DEFAULT_KEYWORDS = [
  "klinik gigi",
  "pemeriksaan gigi",
  "ortodonti",
  "perawatan gigi",
  "dokter gigi",
];

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();

  const title = (s.seoTitle?.trim() || s.clinicName || "Nawasena Dental Care");
  const description = s.seoDescription?.trim() || DEFAULT_DESCRIPTION;
  const keywords =
    s.seoKeywords && s.seoKeywords.length > 0 ? s.seoKeywords : DEFAULT_KEYWORDS;

  const faviconUrl = s.faviconPublicId
    ? buildCloudinaryUrl(s.faviconPublicId, {
        width: 48,
        height: 48,
        crop: "fill",
        format: "png",
      })
    : "";
  const appleUrl = s.faviconPublicId
    ? buildCloudinaryUrl(s.faviconPublicId, {
        width: 180,
        height: 180,
        crop: "fill",
        format: "png",
      })
    : "";
  const ogImage = s.ogImagePublicId
    ? buildCloudinaryUrl(s.ogImagePublicId, {
        width: 1200,
        height: 630,
        crop: "fill",
      })
    : "";

  // Meta verifikasi: Google lewat "verification", Bing lewat "other" (name=).
  // Facebook (property=) dirender sebagai <meta> mentah di RootLayout agar
  // atribut "property" terjaga (metadata.other hanya menghasilkan name=).
  const other: Record<string, string> = {};
  if (s.bingVerification) other["msvalidate.01"] = s.bingVerification;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${title}` },
    description,
    keywords,
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteUrl,
      siteName: s.clinicName || title,
      title: { default: title, template: `%s | ${title}` },
      description,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    icons: faviconUrl ? { icon: faviconUrl, apple: appleUrl || faviconUrl } : undefined,
    verification: s.googleSiteVerification
      ? { google: s.googleSiteVerification }
      : undefined,
    ...(Object.keys(other).length > 0 ? { other } : {}),
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Nilai analitik sudah divalidasi ketat (regex kaku) di sisi server, sehingga
  // aman disisipkan ke dalam snippet. Hanya dimuat bila ID-nya diisi.
  const s = await getSiteSettings();
  const gaId = s.googleAnalyticsId ?? "";
  const gtmId = s.googleTagManagerId ?? "";
  const pixelId = s.metaPixelId ?? "";
  const fbDomain = s.facebookDomainVerification ?? "";

  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${instrumentSans.variable}`}
    >
      <body>
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-site focus:bg-forest focus:px-4 focus:py-3 focus:text-ivory"
        >
          Lewati ke konten
        </a>
        {children}

        {fbDomain ? (
          <meta
            property="facebook-domain-verification"
            content={fbDomain}
          />
        ) : null}

        {gtmId ? (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}

        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}

        {pixelId ? (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
