import type { Metadata } from "next";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { MediaFigure } from "@/components/ui/media-figure";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { buildWhatsAppUrl } from "@/lib/appointment";
import { getDoctors, getGallery, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tentang Klinik",
  description:
    "Filosofi pelayanan, pendekatan perawatan, dan komitmen Nawasena Dental Care kepada pasien.",
};

const values = [
  {
    title: "Komunikasi yang jelas",
    copy: "Kami menjelaskan kondisi, pilihan, dan tahapan perawatan dengan bahasa yang mudah dipahami, sehingga Anda dapat memutuskan dengan tenang.",
  },
  {
    title: "Perencanaan yang cermat",
    copy: "Setiap rencana perawatan disusun berdasarkan hasil pemeriksaan, bukan asumsi. Ketersediaan layanan bergantung pada dokter dan fasilitas klinik.",
  },
  {
    title: "Kenyamanan pasien",
    copy: "Kunjungan dirancang agar tidak terburu-buru, dengan perhatian pada kenyamanan dan rasa hormat selama proses perawatan.",
  },
];

const flowSteps = [
  {
    title: "Konsultasi awal",
    desc: "Sampaikan keluhan dan kebutuhan Anda. Tidak perlu membawa diagnosis sendiri.",
  },
  {
    title: "Pemeriksaan",
    desc: "Dokter menilai kondisi gigi dan mulut secara menyeluruh sebelum menyarankan apa pun.",
  },
  {
    title: "Penjelasan kondisi & pilihan",
    desc: "Hasil pemeriksaan dijelaskan bersama opsi perawatan yang relevan bagi Anda.",
  },
  {
    title: "Persetujuan rencana",
    desc: "Rencana perawatan dan biayanya disepakati bersama sebelum tindakan dimulai.",
  },
  {
    title: "Tindak lanjut",
    desc: "Kontrol dan pemantauan dilakukan sesuai kebutuhan perawatan Anda.",
  },
];

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

export default async function AboutPage() {
  const [settings, gallery, doctors] = await Promise.all([
    getSiteSettings(),
    getGallery(),
    getDoctors(),
  ]);

  const lead = gallery[0] ?? null;
  const team = doctors.slice(0, 3);
  const waHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Halo, saya ingin bertanya mengenai layanan konsultasi gigi dan jadwal kunjungan."
  );

  return (
    <PublicShell>
      {/* Hero editorial */}
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="max-w-xl">
              <Eyebrow>Tentang klinik</Eyebrow>
              <h1 className="mt-4 text-balance text-display text-forest">
                Perawatan gigi yang direncanakan dengan cermat.
              </h1>
              <p className="mt-5 text-charcoal/80">
                Nawasena Dental Care dibangun di atas keyakinan bahwa perawatan
                yang baik dimulai dari pemahaman bersama. Kami memprioritaskan
                pemeriksaan yang teliti, penjelasan yang jujur, dan rencana
                perawatan yang disesuaikan dengan kebutuhan masing-masing pasien.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <LinkButton href="/kontak">Buat Janji Konsultasi</LinkButton>
                <LinkButton href="/layanan" variant="secondary">
                  Lihat Layanan
                </LinkButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {lead ? (
              <div className="overflow-hidden rounded-3xl border border-line">
                <MediaFigure
                  publicId={lead.publicId}
                  alt={lead.alt}
                  width={900}
                  height={700}
                  className="aspect-4/3 w-full"
                  fallback="tooth"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-4/3 items-center justify-center rounded-3xl border border-line bg-sage p-8 text-center">
                <p className="font-serif text-h2 text-forest">
                  Modern Dentistry, Thoughtful Care.
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </Container>

      {/* Filosofi pelayanan */}
      <Section tone="alt">
        <Eyebrow>Filosofi pelayanan</Eyebrow>
        <h2 className="mt-4 max-w-[24ch] text-h2 text-forest">
          Prinsip yang kami pegang dalam merawat.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={Math.min(i, 3) * 70}>
              <div className="h-full rounded-[1.25rem] border border-line bg-white p-6">
                <span className="font-serif text-h3 text-forest/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-h3 text-forest">{value.title}</h3>
                <p className="mt-3 text-charcoal/75">{value.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pendekatan / alur pasien */}
      <Section>
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div>
              <Eyebrow>Pendekatan</Eyebrow>
              <h2 className="mt-4 max-w-[16ch] text-h2 text-forest">
                Dari konsultasi awal hingga tindak lanjut.
              </h2>
              <p className="mt-5 text-charcoal/80">
                Alur kami sederhana dan transparan. Kami tidak menjanjikan hasil
                tertentu; pilihan perawatan ditentukan bersama setelah dokter
                menilai kondisi Anda secara langsung.
              </p>
            </div>
          </Reveal>

          <ol className="space-y-4">
            {flowSteps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={Math.min(i, 5) * 60}>
                <div className="flex gap-4 rounded-[1.25rem] border border-line bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage font-serif text-forest">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-h3 text-forest">{step.title}</h3>
                    <p className="mt-1 text-sm text-charcoal/75">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* Suasana klinik */}
      {gallery.length > 0 && (
        <Section tone="alt">
          <Eyebrow>Pengalaman klinik</Eyebrow>
          <h2 className="mt-4 max-w-[24ch] text-h2 text-forest">
            Suasana Nawasena Dental Care.
          </h2>
          <p className="mt-3 text-small text-charcoal/60">
            Foto bertanda demo — dapat diganti dengan fotografi klinik asli.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.slice(0, 6).map((img, i) => (
              <Reveal key={img.publicId} delay={Math.min(i, 6) * 60}>
                <figure className="overflow-hidden rounded-2xl border border-line">
                  <MediaFigure
                    publicId={img.publicId}
                    alt={img.alt || img.caption || "Foto klinik"}
                    width={600}
                    height={450}
                    className="aspect-4/3 w-full"
                    fallback="tooth"
                  />
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Tim dokter */}
      {team.length > 0 && (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Tim dokter</Eyebrow>
              <h2 className="mt-4 max-w-[24ch] text-h2 text-forest">
                Siapa yang akan merawat Anda.
              </h2>
            </div>
            <LinkButton href="/dokter" variant="secondary">
              Lihat semua dokter
            </LinkButton>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((doctor, i) => (
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

      {/* CTA */}
      <Section tone="alt">
        <div className="rounded-3xl border border-line bg-forest p-8 md:p-12">
          <h2 className="max-w-[20ch] font-serif text-h2 text-ivory">
            Siap memulai dengan rencana yang jelas?
          </h2>
          <p className="mt-4 max-w-prose text-ivory/85">
            Hubungi kami untuk konsultasi. Kami mendengarkan kebutuhan Anda lebih
            dulu, lalu menyusun rencana bersama.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href={waHref} variant="light">
              Konsultasi via WhatsApp
            </LinkButton>
            <LinkButton href="/kontak" variant="outlineLight">
              Ajukan Permintaan Janji
            </LinkButton>
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}
