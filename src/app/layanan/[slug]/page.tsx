import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqList } from "@/components/ui/faq";
import { LinkButton } from "@/components/ui/link-button";
import { MediaFigure } from "@/components/ui/media-figure";
import { Section } from "@/components/ui/section";
import { buildWhatsAppUrl, serviceConsultMessage } from "@/lib/appointment";
import { getServiceBySlug, getServices, getSiteSettings } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Layanan tidak ditemukan" };
  return {
    title: service.name,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
  ]);

  if (!service) notFound();

  const waHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    serviceConsultMessage(service.name)
  );

  return (
    <PublicShell>
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Link
          href="/layanan"
          className="text-small font-medium text-forest underline underline-offset-4 hover:text-charcoal"
        >
          ← Semua layanan
        </Link>
        <Eyebrow>Layanan</Eyebrow>
        <h1 className="mt-4 max-w-[18ch] text-display text-forest">
          {service.name}
        </h1>
        <p className="mt-6 max-w-prose text-charcoal/80">{service.summary}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href={waHref}>Konsultasi via WhatsApp</LinkButton>
          <LinkButton href="/kontak" variant="secondary">
            Ajukan Permintaan Janji
          </LinkButton>
        </div>
      </Container>

      <Container className="pb-4">
        <div className="overflow-hidden rounded-3xl border border-line">
          <MediaFigure
            publicId={service.coverPublicId}
            alt={service.coverAlt ?? service.name}
            width={1280}
            height={720}
            className="aspect-video w-full"
            priority
          />
        </div>
      </Container>

      <Section tone="alt" className="pt-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-h2 text-forest">Penjelasan layanan</h2>
            <p className="mt-5 text-charcoal/80">{service.description}</p>
          </div>

          <div className="rounded-3xl border border-line bg-sage p-6">
            <p className="text-small uppercase tracking-[0.12em] text-forest/70">
              Catatan ketersediaan
            </p>
            <p className="mt-3 text-charcoal/85">
              {service.availabilityNote ??
                "Ketersediaan layanan bergantung pada dokter, fasilitas, dan layanan aktual klinik."}
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Alasan umum konsultasi</Eyebrow>
            <ul className="mt-5 space-y-3">
              {service.consultReasons.map((reason) => (
                <li
                  key={reason}
                  className="border-b border-line pb-3 text-charcoal/85 last:border-0"
                >
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Eyebrow>Gambaran proses</Eyebrow>
            <ol className="mt-5 space-y-3">
              {service.processSteps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-4 border-b border-line pb-3 text-charcoal/85 last:border-0"
                >
                  <span className="font-serif text-h3 text-forest/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mt-8 max-w-prose text-small text-charcoal/60">
          Informasi ini bersifat umum dan tidak menggantikan pemeriksaan. Pilihan
          perawatan ditentukan setelah dokter menilai kondisi Anda secara
          langsung.
        </p>
      </Section>

      {service.faqs.length > 0 && (
        <Section tone="alt">
          <Eyebrow>Pertanyaan umum</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] text-h2 text-forest">
            Hal yang sering ditanyakan.
          </h2>
          <FaqList items={service.faqs} />
        </Section>
      )}

      <Section>
        <div className="rounded-3xl border border-line bg-forest p-8 md:p-12">
          <h2 className="max-w-[20ch] font-serif text-h2 text-ivory">
            Siap menanyakan layanan ini?
          </h2>
          <p className="mt-4 max-w-prose text-ivory/85">
            Hubungi kami untuk konsultasi. Pesan awal hanya memuat nama layanan
            dan kebutuhan jadwal, tanpa informasi medis pribadi.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href={waHref} variant="light">
              Konsultasi via WhatsApp
            </LinkButton>
            <LinkButton href="/kontak" variant="outlineLight">
              Halaman Kontak
            </LinkButton>
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}
