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

// Alur yang berlaku untuk setiap layanan (urutan nyata, bukan klaim hasil).
const flowSteps = [
  {
    title: "Konsultasi",
    desc: "Anda menyampaikan keluhan dan kebutuhan. Tidak perlu membawa diagnosis sendiri.",
  },
  {
    title: "Pemeriksaan",
    desc: "Dokter menilai kondisi gigi dan mulut secara menyeluruh sebelum menyarankan apa pun.",
  },
  {
    title: "Rencana perawatan",
    desc: "Pilihan perawatan dan biayanya dijelaskan, lalu diputuskan bersama Anda.",
  },
];

function ArrowCircle() {
  return (
    <span
      aria-hidden
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-forest/30 text-forest transition-all duration-200 group-hover:border-forest group-hover:bg-forest group-hover:text-ivory"
    >
      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </span>
  );
}

export default async function ServicesPage() {
  const services = await getServices();
  const [featured, ...others] = services;

  return (
    <PublicShell>
      {/* Header halaman */}
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[1.25fr_0.75fr] md:items-end md:gap-14">
            <div>
              <Eyebrow>Layanan</Eyebrow>
              <h1 className="mt-4 max-w-[16ch] text-display text-balance text-forest">
                Perawatan yang dijelaskan dengan jelas sejak awal.
              </h1>
            </div>
            <div className="border-l-2 border-sage pl-5">
              <p className="text-charcoal/80">
                Setiap layanan dimulai dari konsultasi dan pemeriksaan. Pilihan
                perawatan akhir ditentukan bersama dokter berdasarkan hasil
                pemeriksaan, bukan ditetapkan otomatis.
              </p>
              {services.length > 0 && (
                <p className="mt-4 font-serif text-h3 text-forest">
                  {services.length} layanan tersedia
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Daftar layanan */}
      <Section className="pt-0">
        {/* Layanan pertama tampil lebih besar */}
        {featured && (
          <Reveal>
            <Link
              href={`/layanan/${featured.slug}`}
              className="group grid overflow-hidden rounded-3xl border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest md:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="relative overflow-hidden">
                <MediaFigure
                  publicId={featured.coverPublicId}
                  alt={featured.coverAlt ?? featured.name}
                  width={960}
                  height={720}
                  className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.04] md:aspect-auto md:h-full md:min-h-90"
                />
              </div>
              <div className="flex flex-col justify-center p-7 md:p-10">
                <p className="text-small text-charcoal/60">Layanan utama</p>
                <h2 className="mt-3 max-w-[18ch] text-h2 text-forest">
                  {featured.name}
                </h2>
                <p className="mt-4 max-w-prose text-charcoal/80">
                  {featured.summary}
                </p>
                {featured.availabilityNote && (
                  <p className="mt-4 rounded-xl bg-sage px-4 py-3 text-small text-charcoal/70">
                    {featured.availabilityNote}
                  </p>
                )}
                <span className="mt-6 inline-flex items-center gap-3 text-small font-medium text-forest">
                  Lihat penjelasan lengkap
                  <ArrowCircle />
                </span>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Layanan lainnya */}
        {others.length > 0 && (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {others.map((service, i) => (
              <Reveal key={service.slug} delay={Math.min(i, 5) * 70}>
                <Link
                  href={`/layanan/${service.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest"
                >
                  <div className="overflow-hidden">
                    <MediaFigure
                      publicId={service.coverPublicId}
                      alt={service.coverAlt ?? service.name}
                      width={640}
                      height={400}
                      className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-h3 text-forest">{service.name}</h2>
                    <p className="mt-3 flex-1 text-charcoal/75">
                      {service.summary}
                    </p>
                    {service.availabilityNote && (
                      <p className="mt-4 text-small text-charcoal/60">
                        {service.availabilityNote}
                      </p>
                    )}
                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-small font-medium text-forest">
                        Selengkapnya
                      </span>
                      <ArrowCircle />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      {/* Alur setiap layanan */}
      <Section tone="alt">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Sebelum perawatan dimulai</Eyebrow>
              <h2 className="mt-4 max-w-[16ch] text-h2 text-forest">
                Tiga langkah yang sama untuk setiap layanan.
              </h2>
            </div>
            <ol className="grid gap-0">
              {flowSteps.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-5 border-b border-line py-5 transition-colors last:border-0 hover:bg-white/60"
                >
                  <span className="font-serif text-h3 text-forest/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium text-forest">{step.title}</p>
                    <p className="mt-1 text-sm text-charcoal/75">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Section>

      {/* CTA penutup */}
      <section className="bg-forest">
        <Container className="py-14 md:py-16">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h2 className="max-w-[24ch] text-h2 text-ivory">
                  Belum yakin layanan mana yang Anda butuhkan?
                </h2>
                <p className="mt-3 max-w-prose text-ivory/80">
                  Mulai dari konsultasi. Dokter akan membantu menentukan
                  langkah yang sesuai setelah pemeriksaan.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-4">
                <LinkButton
                  href="/kontak"
                  variant="secondary"
                  className="border-ivory bg-ivory text-forest transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Ajukan Permintaan Janji
                </LinkButton>
                <LinkButton
                  href="/"
                  variant="secondary"
                  className="border-ivory/50 bg-transparent text-ivory transition-all duration-200 hover:-translate-y-0.5 hover:border-ivory hover:bg-transparent"
                >
                  Kembali ke Beranda
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PublicShell>
  );
}