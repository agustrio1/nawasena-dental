import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqList } from "@/components/ui/faq";
import { LinkButton } from "@/components/ui/link-button";
import { MediaFigure } from "@/components/ui/media-figure";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { buildWhatsAppUrl, serviceConsultMessage } from "@/lib/appointment";
import {
  getArticles,
  getDoctors,
  getServiceBySlug,
  getServices,
  getSiteSettings,
} from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

// Rute ini membaca URL data (params) saat render. Dalam cacheComponents,
// tandai sebagai blocking route agar tidak memaksa shell instant menunggu params.
export const instant = false;

// Value prop level klinik (bukan klaim hasil). Memakai pola "Kenapa memilih"
// seperti halaman layanan klinik gigi pada umumnya — isinya berlaku untuk
// seluruh layanan, bukan data spesifik per-baris, jadi tidak perlu kolom baru.
const whyChooseUs = [
  {
    title: "Ditangani dokter gigi berpengalaman",
    desc: "Setiap tindakan dilakukan oleh dokter yang sesuai bidangnya, dengan penjelasan yang jelas sebelum perawatan dimulai.",
  },
  {
    title: "Perencanaan yang personal",
    desc: "Rencana perawatan disusun berdasarkan hasil pemeriksaan dan kebutuhan Anda, bukan ditetapkan otomatis.",
  },
  {
    title: "Peralatan dan material sesuai standar",
    desc: "Prosedur mengikuti standar kebersihan dan keselamatan klinik. Detail fasilitas dapat dikonfirmasi saat konsultasi.",
  },
  {
    title: "Komunikasi tenang tanpa paksaan",
    desc: "Anda diberi pilihan dan waktu untuk memutuskan, termasuk opsi perawatan lain bila tersedia.",
  },
];

// Inisial untuk avatar dokter bila foto belum tersedia (buang label "(data demo)").
function doctorInitials(name: string) {
  return name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

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
  const [service, settings, doctors, articles] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
    getDoctors(),
    getArticles(),
  ]);

  if (!service) notFound();

  const waHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    serviceConsultMessage(service.name)
  );
  const teamDoctors = doctors.slice(0, 3);
  const relatedArticles = articles.slice(0, 3);

  return (
    <PublicShell>
      {/* Hero: teks kiri + gambar kanan yang bleed ke tepi layar (konsisten home). */}
      <section className="grid items-stretch md:grid-cols-2">
        <div className="px-5 py-12 md:px-8 md:py-16 lg:pl-[max(2rem,calc((100vw-75rem)/2+2rem))] lg:py-20">
          <Reveal>
            <div className="max-w-xl">
              <Link
                href="/layanan"
                className="text-small font-medium text-forest underline underline-offset-4 hover:text-charcoal"
              >
                ← Semua layanan
              </Link>
              <div className="mt-6">
                <Eyebrow>Layanan</Eyebrow>
              </div>
              <h1 className="mt-4 max-w-[15ch] text-display text-balance text-forest">
                {service.name}
              </h1>
              <p className="mt-5 max-w-prose text-charcoal/80">
                {service.summary}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <LinkButton
                  href={waHref}
                  className="transition-all duration-200 hover:-translate-y-0.5"
                >
                  Konsultasi via WhatsApp
                </LinkButton>
                <LinkButton href="/kontak" variant="secondary">
                  Ajukan Permintaan Janji
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="relative min-h-95 overflow-hidden bg-ivory sm:min-h-120">
          <MediaFigure
            publicId={service.coverPublicId}
            alt={service.coverAlt ?? service.name}
            width={1200}
            height={1300}
            className="h-full w-full"
            fallback="tooth"
            priority
          />
        </div>
      </section>

      {/* Penjelasan + catatan ketersediaan */}
      <Section>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow>Tentang perawatan ini</Eyebrow>
            <h2 className="mt-4 max-w-[20ch] text-h2 text-forest">
              {service.name} di Nawasena
            </h2>
            <p className="mt-5 text-charcoal/80">{service.description}</p>
          </div>

          <aside className="h-fit rounded-3xl border border-line bg-sage p-6">
            <p className="text-small uppercase tracking-[0.12em] text-forest/70">
              Catatan ketersediaan
            </p>
            <p className="mt-3 text-charcoal/85">
              {service.availabilityNote ??
                "Ketersediaan layanan bergantung pada dokter, fasilitas, dan layanan aktual klinik."}
            </p>
          </aside>
        </div>
      </Section>

      {/* Kenapa memilih (value prop klinik, bergaya bernomor) */}
      <Section tone="alt">
        <Eyebrow>Kenapa Nawasena</Eyebrow>
        <h2 className="mt-4 max-w-[26ch] text-h2 text-forest">
          Kenapa memilih {service.name} di Nawasena Dental Care?
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {whyChooseUs.map((item, i) => (
            <Reveal key={item.title} delay={Math.min(i, 3) * 70}>
              <div className="flex h-full gap-5 rounded-[1.25rem] border border-line bg-white p-6">
                <span className="font-serif text-h2 leading-none text-forest/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-h3 text-forest">{item.title}</h3>
                  <p className="mt-2 text-charcoal/75">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Alasan konsultasi + gambaran proses */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Alasan umum konsultasi</Eyebrow>
            <ul className="mt-5 space-y-3">
              {service.consultReasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 border-b border-line pb-3 text-charcoal/85 last:border-0"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest"
                  />
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

      {/* Tim dokter */}
      {teamDoctors.length > 0 && (
        <Section tone="alt">
          <Eyebrow>Tim dokter</Eyebrow>
          <h2 className="mt-4 max-w-[24ch] text-h2 text-forest">
            Didukung tim dokter kami
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teamDoctors.map((doctor, i) => (
              <Reveal key={doctor.name} delay={Math.min(i, 3) * 70}>
                <div className="flex h-full items-center gap-4 rounded-[1.25rem] border border-line bg-white p-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full">
                    <MediaFigure
                      publicId={doctor.photoPublicId}
                      alt={doctor.photoAlt ?? doctor.name}
                      width={160}
                      height={160}
                      className="h-full w-full"
                      fallback="person"
                      initials={doctorInitials(doctor.name)}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-forest">{doctor.name}</p>
                    <p className="mt-1 text-small text-charcoal/70">
                      {doctor.specialty}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      {service.faqs.length > 0 && (
        <Section>
          <Eyebrow>Pertanyaan umum</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] text-h2 text-forest">
            Hal yang sering ditanyakan.
          </h2>
          <FaqList items={service.faqs} />
        </Section>
      )}

      {/* Artikel terkait */}
      {relatedArticles.length > 0 && (
        <Section tone="alt">
          <Eyebrow>Artikel kesehatan gigi</Eyebrow>
          <h2 className="mt-4 max-w-[24ch] text-h2 text-forest">
            Artikel terkait
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {relatedArticles.map((article, i) => (
              <Reveal key={article.slug} delay={Math.min(i, 3) * 70}>
                <Link
                  href={`/artikel/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest"
                >
                  <MediaFigure
                    publicId={article.coverPublicId}
                    alt={article.coverAlt ?? article.title}
                    width={640}
                    height={400}
                    className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                    fallback="tooth"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-small uppercase tracking-[0.12em] text-forest/60">
                      {article.category}
                    </p>
                    <h3 className="mt-2 text-h3 text-forest">
                      {article.title}
                    </h3>
                    <p className="mt-3 flex-1 text-charcoal/75">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* CTA akhir */}
      <Section>
        <div className="rounded-3xl border border-line bg-forest p-8 md:p-12">
          <h2 className="max-w-[20ch] font-serif text-h2 text-ivory">
            Siap menanyakan {service.name.toLowerCase()}?
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
