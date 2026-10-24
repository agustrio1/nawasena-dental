import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PublicShell } from "@/components/public/public-shell";
import { AppointmentForm } from "@/components/public/appointment-form";
import { MapEmbed } from "@/components/public/map-embed";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqList } from "@/components/ui/faq";
import { LinkButton } from "@/components/ui/link-button";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { buildWhatsAppUrl } from "@/lib/appointment";
import { getFaqs, getServices, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kontak & Permintaan Janji",
  description:
    "Hubungi Nawasena Dental Care dan ajukan permintaan janji konsultasi melalui WhatsApp atau formulir.",
};

function IconPin() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 20 12Z" />
    </svg>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full gap-4 rounded-[1.25rem] border border-line bg-white p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage text-forest">
        {icon}
      </span>
      <div>
        <p className="text-small uppercase tracking-[0.12em] text-forest/70">
          {label}
        </p>
        <div className="mt-1 text-charcoal/85">{children}</div>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const [settings, services, faqs] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getFaqs(),
  ]);

  const waHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Halo, saya ingin bertanya mengenai layanan konsultasi gigi dan jadwal kunjungan."
  );

  const socials = [
    { label: "Instagram", url: settings.instagramUrl },
    { label: "Facebook", url: settings.facebookUrl },
    { label: "TikTok", url: settings.tiktokUrl },
    { label: "YouTube", url: settings.youtubeUrl },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <PublicShell>
      <Container className="pb-8 pt-14 md:pt-20">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Kontak</Eyebrow>
            <h1 className="mt-4 text-balance text-display text-forest">
              Ajukan permintaan janji.
            </h1>
            <p className="mt-5 text-charcoal/80">
              Pilih langsung menghubungi via WhatsApp, atau isi formulir berikut.
              Permintaan yang dikirim disimpan sebagai usulan — jadwal final baru
              dikonfirmasi setelah tim klinik menindaklanjuti.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <LinkButton href={waHref}>Chat WhatsApp</LinkButton>
              <LinkButton href="#form-janji" variant="secondary">
                Isi Formulir
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Informasi + formulir */}
      <Section tone="alt" className="pt-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <h2 className="text-h2 text-forest">Informasi klinik</h2>
            <div className="mt-6 grid gap-4">
              <InfoCard icon={<IconPin />} label="Alamat (demo)">
                {settings.addressText}
              </InfoCard>
              <InfoCard icon={<IconClock />} label="Jam praktik (demo)">
                {settings.hoursText}
              </InfoCard>
              <InfoCard icon={<IconChat />} label="WhatsApp">
                <a
                  href={waHref}
                  className="font-medium text-forest underline underline-offset-4 hover:text-charcoal"
                >
                  {settings.whatsappNumber
                    ? `+${settings.whatsappNumber}`
                    : "Hubungi kami"}
                </a>
              </InfoCard>
            </div>

            {socials.length > 0 && (
              <div className="mt-6">
                <p className="text-small uppercase tracking-[0.12em] text-forest/70">
                  Ikuti kami
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-small font-medium text-forest underline underline-offset-4 hover:text-charcoal"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 text-small text-charcoal/60">
              Alamat dan jam di atas adalah data demo. Peta dapat digeser atau
              dibuka langsung di Google Maps.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div id="form-janji" className="scroll-mt-24">
              <AppointmentForm
                services={services.map((s) => ({ id: s.id, name: s.name }))}
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Peta */}
      <Section>
        <Eyebrow>Lokasi</Eyebrow>
        <h2 className="mt-4 max-w-[24ch] text-h2 text-forest">
          Temukan klinik kami.
        </h2>
        <div className="mt-8">
          <MapEmbed
            query={settings.mapsQuery ?? settings.addressText}
            label={settings.addressText}
            className="aspect-video"
          />
        </div>
      </Section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <Section tone="alt">
          <Eyebrow>Pertanyaan umum</Eyebrow>
          <h2 className="mt-4 max-w-[20ch] text-h2 text-forest">
            Hal yang sering ditanyakan.
          </h2>
          <FaqList items={faqs} />
        </Section>
      )}
    </PublicShell>
  );
}
