import type { Metadata } from "next";
import Link from "next/link";

import { PublicShell } from "@/components/public/public-shell";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { MediaFigure } from "@/components/ui/media-figure";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Layanan Nawasena Dental Care, dari pemeriksaan rutin hingga ortodonti. Ketersediaan bergantung pada dokter dan fasilitas klinik.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <PublicShell>
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Reveal>
          <Eyebrow>Layanan</Eyebrow>
          <h1 className="mt-4 max-w-[16ch] text-display text-forest">
            Perawatan yang dijelaskan dengan jelas sejak awal.
          </h1>
          <p className="mt-6 max-w-prose text-charcoal/80">
            Setiap layanan dimulai dari konsultasi dan pemeriksaan. Pilihan
            perawatan akhir ditentukan bersama dokter berdasarkan hasil
            pemeriksaan, bukan ditetapkan otomatis.
          </p>
        </Reveal>
      </Container>

      <Section className="pt-0">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={Math.min(i, 5) * 70}>
              <Link
                href={`/layanan/${service.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest"
              >
                <MediaFigure
                  publicId={service.coverPublicId}
                  alt={service.coverAlt ?? service.name}
                  width={640}
                  height={400}
                  className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-h3 text-forest">{service.name}</h2>
                  <p className="mt-3 flex-1 text-charcoal/75">{service.summary}</p>
                  {service.availabilityNote && (
                    <p className="mt-4 text-small text-charcoal/60">
                      {service.availabilityNote}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-small font-medium text-forest">
                    Selengkapnya
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <LinkButton href="/kontak">Ajukan Permintaan Janji</LinkButton>
          <LinkButton href="/" variant="secondary">
            Kembali ke Beranda
          </LinkButton>
        </div>
      </Section>
    </PublicShell>
  );
}
