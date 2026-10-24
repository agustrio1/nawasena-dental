import type { Metadata } from "next";

import { PublicShell } from "@/components/public/public-shell";
import { AppointmentForm } from "@/components/public/appointment-form";
import { MapEmbed } from "@/components/public/map-embed";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { buildWhatsAppUrl } from "@/lib/appointment";
import { getServices, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kontak & Permintaan Janji",
  description:
    "Hubungi Nawasena Dental Care dan ajukan permintaan janji konsultasi melalui WhatsApp atau formulir.",
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getServices(),
  ]);

  const waHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Halo, saya ingin bertanya mengenai layanan konsultasi gigi dan jadwal kunjungan."
  );

  return (
    <PublicShell>
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Eyebrow>Kontak</Eyebrow>
        <h1 className="mt-4 max-w-[16ch] text-display text-forest">
          Ajukan permintaan janji.
        </h1>
        <p className="mt-6 max-w-prose text-charcoal/80">
          Pilih langsung menghubungi via WhatsApp, atau isi formulir berikut.
          Permintaan yang dikirim disimpan sebagai usulan — jadwal final baru
          dikonfirmasi setelah tim klinik menindaklanjuti.
        </p>
      </Container>

      <Section className="pt-0" tone="alt">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-h2 text-forest">Informasi klinik</h2>
            <dl className="mt-6 space-y-4 text-charcoal/80">
              <div>
                <dt className="text-small uppercase tracking-[0.12em] text-forest/70">
                  Alamat (demo)
                </dt>
                <dd className="mt-1">{settings.addressText}</dd>
              </div>
              <div>
                <dt className="text-small uppercase tracking-[0.12em] text-forest/70">
                  Jam praktik (demo)
                </dt>
                <dd className="mt-1">{settings.hoursText}</dd>
              </div>
            </dl>
            <div className="mt-8">
              <LinkButton href={waHref}>Chat WhatsApp</LinkButton>
            </div>
            <p className="mt-6 text-small text-charcoal/60">
              Alamat dan jam di atas adalah data demo. Peta dapat digeser atau
              dibuka langsung di Google Maps.
            </p>
            <div className="mt-6">
              <MapEmbed
                query={settings.mapsQuery ?? settings.addressText}
                label={settings.addressText}
              />
            </div>
          </div>

          <AppointmentForm
            services={services.map((s) => ({ id: s.id, name: s.name }))}
          />
        </div>
      </Section>
    </PublicShell>
  );
}
