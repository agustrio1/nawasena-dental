import Image from "next/image";
import Link from "next/link";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqList } from "@/components/ui/faq";
import { LinkButton } from "@/components/ui/link-button";
import { MapEmbed } from "@/components/public/map-embed";
import { MediaFigure } from "@/components/ui/media-figure";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { buildWhatsAppUrl } from "@/lib/appointment";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import {
  getArticles,
  getDoctors,
  getFaqs,
  getGallery,
  getServices,
  getSiteSettings,
} from "@/lib/content";

// Alur klinis (konsultasi -> tindak lanjut). Bukan klaim hasil.
const approachSteps = [
  "Konsultasi awal",
  "Pemeriksaan",
  "Penjelasan kondisi dan pilihan perawatan",
  "Persetujuan rencana perawatan",
  "Tindak lanjut sesuai kebutuhan",
];

// Langkah membuat janji (alur reservasi via WhatsApp).
const bookingSteps = [
  {
    title: "Pilih layanan",
    desc: "Tinjau layanan dan tentukan kebutuhan Anda.",
  },
  {
    title: "Chat WhatsApp",
    desc: "Klik tombol — pesan awal terisi otomatis, tanpa data medis.",
  },
  {
    title: "Atur jadwal",
    desc: "Tim mengusulkan waktu; jadwal final dikonfirmasi klinik.",
  },
  {
    title: "Datang & konsultasi",
    desc: "Pemeriksaan dan penyusunan rencana perawatan bersama dokter.",
  },
];

// Pernyataan pendekatan (bukan klaim medis/hasil pasti).
const valueProps = [
  {
    title: "Pemeriksaan teliti",
    desc: "Kondisi gigi dinilai menyeluruh sebelum rencana perawatan disusun.",
  },
  {
    title: "Komunikasi jelas",
    desc: "Dijelaskan dengan bahasa yang mudah dipahami, tanpa jargon.",
  },
  {
    title: "Rencana bersama",
    desc: "Pilihan perawatan ditentukan bersama, bukan ditetapkan otomatis.",
  },
  {
    title: "Nyaman & tertata",
    desc: "Suasana klinik dirancang agar kunjungan tidak terasa menegangkan.",
  },
];

// CONTOH DATA DEMO — bukan angka aktual. Wajib diganti dengan data nyata
// yang telah diverifikasi sebelum dipakai untuk klinik sungguhan.
const demoStats = [
  { value: "16+", label: "Tahun pengalaman" },
  { value: "5", label: "Dokter & spesialis" },
  { value: "24/7", label: "Reservasi via WhatsApp" },
  { value: "5,0", label: "Rating ulasan pasien" },
];

// ULASAN DEMO — placeholder, bukan ulasan pasien nyata.
const demoTestimonials = [
  {
    quote:
      "Pemeriksaannya teliti dan penjelasannya mudah dipahami. Tidak ada kesan diburu-buru.",
    name: "Nama Contoh",
    role: "Pasien (demo)",
  },
  {
    quote:
      "Kliniknya bersih dan tenang. Dokter menjelaskan beberapa pilihan perawatan sebelum memutuskan.",
    name: "Nama Contoh",
    role: "Pasien (demo)",
  },
  {
    quote:
      "Proses pembuatan janji lewat WhatsApp praktis. Jadwal dikonfirmasi tim sebelum kunjungan.",
    name: "Nama Contoh",
    role: "Pasien (demo)",
  },
];

const fallbackFaqs = [
  {
    question: "Bagaimana cara membuat janji?",
    answer:
      "Gunakan tombol WhatsApp atau kirim permintaan janji melalui halaman Kontak. Jadwal final dikonfirmasi setelah tim klinik menindaklanjuti permintaan Anda.",
  },
  {
    question: "Apakah perlu membuat janji sebelum datang?",
    answer:
      "Disarankan membuat janji lebih awal agar waktu konsultasi lebih teraturan. Untuk keluhan mendadak, hubungi kami terlebih dahulu.",
  },
  {
    question: "Bagaimana mengetahui biaya perawatan?",
    answer:
      "Biaya disampaikan setelah dokter melakukan pemeriksaan dan menyusun rencana perawatan, karena kebutuhan setiap pasien berbeda.",
  },
  {
    question: "Apa yang perlu dipersiapkan sebelum konsultasi?",
    answer:
      "Cukup sampaikan keluhan atau kebutuhan Anda serta riwayat perawatan gigi sebelumnya jika ada. Anda tidak perlu membawa diagnosis sendiri.",
  },
  {
    question: "Apakah tersedia konsultasi untuk beberapa pilihan perawatan?",
    answer:
      "Ya. Dokter dapat menjelaskan beberapa opsi perawatan beserta pertimbangannya agar Anda memutuskan dengan tenang.",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [services, doctors, articles, faqs, gallery, settings] =
    await Promise.all([
      getServices(),
      getDoctors(),
      getArticles(),
      getFaqs(),
      getGallery(),
      getSiteSettings(),
    ]);

  const heroWa = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Halo, saya ingin bertanya mengenai layanan konsultasi gigi dan jadwal kunjungan."
  );

  // Prioritas gambar hero: upload banner di Site Settings > foto galeri
  // pertama. Bila keduanya kosong, tampilkan ilustrasi gigi (bukan foto palsu).
  const heroPublicId =
    settings.heroImagePublicId ?? gallery[0]?.publicId ?? null;
  const heroAlt = settings.heroImagePublicId
    ? settings.clinicName
    : gallery[0]?.alt ?? settings.clinicName;

  // Gambar hero: c_limit (tanpa crop paksa) + lebar besar 2400px supaya tajam
  // di layar lebar/retina. Latar putih foto disamakan ke ivory lewat overlay
  // CSS mix-blend-multiply di kolom gambar (tanpa add-on Cloudinary).
  const heroUrl = heroPublicId
    ? buildCloudinaryUrl(heroPublicId, {
        width: 2400,
        quality: "auto",
        crop: "limit",
      })
    : null;

  return (
    <PublicShell>
      {/* Hero — split: teks kiri, gambar bleed ke tepi kanan (ala FDC) */}
      <section className="grid items-stretch md:grid-cols-2">
        <div className="px-5 py-12 md:px-8 md:py-16 lg:py-20 lg:pl-[max(2rem,calc((100vw-75rem)/2+2rem))]">
          <Reveal>
            <div className="max-w-xl">
              <Eyebrow>Klinik gigi</Eyebrow>
              <h1 className="mt-4 max-w-[15ch] text-display text-balance text-forest">
                Perawatan gigi yang direncanakan dengan cermat.
              </h1>
              <p className="mt-5 max-w-prose text-charcoal/80">
                {settings.clinicName} menyatukan pemeriksaan rutin, penjelasan
                yang mudah dipahami, dan rencana perawatan yang disesuaikan
                dengan kebutuhan setiap pasien.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <LinkButton
                  href={heroWa}
                  className="transition-all duration-200 hover:-translate-y-0.5"
                >
                  Buat Janji Konsultasi
                </LinkButton>
                <LinkButton href="/layanan" variant="secondary">
                  Lihat Layanan
                </LinkButton>
              </div>
              <ul className="mt-10 grid gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
                {valueProps.slice(0, 3).map((v) => (
                  <li key={v.title} className="border-l-2 border-sage pl-4">
                    <p className="font-medium text-forest">{v.title}</p>
                    <p className="mt-1 text-sm text-charcoal/70">{v.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Gambar: mengisi penuh kolom kanan sampai tepi viewport.
            Fokus diarahkan ke bagian atas (wajah/senyum) agar tidak terpotong. */}
        <div className="relative min-h-95 overflow-hidden bg-ivory sm:min-h-120">
          {heroUrl ? (
            <>
              <Image
                src={heroUrl}
                alt={heroAlt}
                fill
                sizes="(min-width:768px) 50vw, 100vw"
                priority
                className="object-cover object-[center_15%]"
              />
              {/* Menyamakan latar putih foto ke ivory situs: mengalikan (multiply)
                  dengan ivory (#F8F7F3 ~ putih) mengubah putih jadi persis ivory,
                  sementara subjek hanya ~3% lebih gelap (tak terasa). */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-ivory mix-blend-multiply"
              />
            </>
          ) : (
            // Belum ada banner: ilustrasi gigi (bukan foto palsu) sebagai
            // placeholder. Upload lewat admin untuk menggantinya.
            <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-sage px-8 text-center">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-24 w-24 text-forest/25"
              >
                <path d="M12 4.5c-1.9 0-2.6 1.1-4.2 1.1S5 4.7 5 7.4c0 2.8 1.1 4.9 1.8 7.6.4 1.6.6 4.5 1.8 4.5s1-2.7 1.4-4.2c.3-1.2.6-1.8 1.2-1.8s.9.6 1.2 1.8c.4 1.5.6 4.2 1.4 4.2s1.4-2.9 1.8-4.5C20 12.3 21 10.2 21 7.4c0-2.7-1-2.9-2.8-2.9S13.9 4.5 12 4.5Z" />
              </svg>
              <div>
                <p className="text-small uppercase tracking-[0.14em] text-forest/60">
                  {settings.clinicName}
                </p>
                <p className="mt-2 font-serif text-h3 text-forest">
                  Senyum sehat, perawatan tenang.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bar statistik (CONTOH DATA DEMO) */}
      <section className="border-y border-line bg-white">
        <Container className="py-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.14em] text-charcoal/45">
              Contoh data demo — bukan angka aktual, diganti dengan data terverifikasi
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {demoStats.map((s) => (
                <div key={s.label} className="text-center">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-serif text-3xl text-forest sm:text-4xl">
                      {s.value}
                    </span>
                    <span className="mt-1 block text-sm text-charcoal/65">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Layanan unggulan */}
      <Section id="layanan">
        <Reveal>
          <Eyebrow>Layanan unggulan</Eyebrow>
          <h2 className="mt-4 max-w-[22ch] text-h2 text-forest">
            Pilih layanan untuk melihat penjelasan lebih detail.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={Math.min(i, 5) * 70}>
              <Link
                href={`/layanan/${service.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-ivory transition-all duration-200 hover:-translate-y-1 hover:border-forest hover:bg-white"
              >
                <MediaFigure
                  publicId={service.coverPublicId}
                  alt={service.coverAlt ?? service.name}
                  width={640}
                  height={400}
                  className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-h3 text-forest">{service.name}</h3>
                  <p className="mt-3 flex-1 text-charcoal/75">{service.summary}</p>
                  {service.availabilityNote && (
                    <p className="mt-4 text-small text-charcoal/60">
                      {service.availabilityNote}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-small font-medium text-forest">
                    Selengkapnya
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Kenapa memilih kami + tentang */}
      <Section id="tentang" tone="alt">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <Reveal>
            <Eyebrow>Kenapa memilih kami</Eyebrow>
            <h2 className="mt-4 max-w-[18ch] text-h2 text-forest">
              Perawatan yang tenang, jelas, dan berorientasi pada kebutuhan pasien.
            </h2>
            <p className="mt-6 text-charcoal/80">
              Kami membangun pengalaman perawatan yang tidak terasa terburu-buru.
              Setiap kunjungan dimulai dari penjelasan yang mudah dipahami,
              pemeriksaan yang cermat, dan perencanaan yang disusun bersama pasien.
            </p>
            <p className="mt-4 text-charcoal/80">
              Pendekatan kami mengutamakan kesehatan mulut secara menyeluruh dan
              komunikasi yang jujur, tanpa menjanjikan hasil yang pasti.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
              {valueProps.map((v) => (
                <li key={v.title} className="bg-white p-6">
                  <p className="font-medium text-forest">{v.title}</p>
                  <p className="mt-1.5 text-sm text-charcoal/70">{v.desc}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* Cara membuat janji */}
      <Section id="pemesanan">
        <Reveal>
          <Eyebrow>Cara membuat janji</Eyebrow>
          <h2 className="mt-4 max-w-[20ch] text-h2 text-forest">
            Reservasi sederhana, dari pilihan layanan hingga kunjungan.
          </h2>
        </Reveal>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bookingSteps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={Math.min(i, 4) * 70}>
              <div className="flex h-full flex-col rounded-[1.25rem] border border-line bg-ivory p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest">
                <span className="font-serif text-h3 text-forest/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-h3 text-forest">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm text-charcoal/75">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <div className="mt-8">
            <LinkButton
              href={heroWa}
              className="transition-all duration-200 hover:-translate-y-0.5"
            >
              Buat Janji via WhatsApp
            </LinkButton>
          </div>
        </Reveal>
      </Section>

      {/* Profil dokter */}
      <Section id="dokter" tone="alt">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Tim dokter</Eyebrow>
              <h2 className="mt-4 max-w-[20ch] text-h2 text-forest">
                Dokter yang menjelaskan, bukan sekadar memeriksa.
              </h2>
            </div>
            <Link
              href="/dokter"
              className="text-small font-medium text-forest underline underline-offset-4 transition-colors hover:text-charcoal"
            >
              Lihat seluruh tim
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {doctors.map((doctor, i) => (
            <Reveal key={doctor.name} delay={Math.min(i, 3) * 70}>
              <article className="flex h-full flex-col gap-5 rounded-[1.25rem] border border-line bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest sm:flex-row">
                <MediaFigure
                  publicId={doctor.photoPublicId}
                  alt={doctor.photoAlt ?? `Foto ${doctor.name}`}
                  width={240}
                  height={240}
                  fallback="person"
                  initials={doctor.name.split(" ").slice(-1)[0].slice(0, 1)}
                  className="aspect-square w-24 shrink-0 self-start rounded-2xl"
                />
                <div className="min-w-0">
                  <h3 className="text-h3 text-forest">{doctor.name}</h3>
                  <p className="mt-1 text-charcoal/70">{doctor.specialty}</p>
                  <p className="mt-3 text-small text-charcoal/60">
                    Data demo — profil lengkap dapat diganti dengan data dokter
                    yang telah disetujui.
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pengalaman klinik (galeri) */}
      {gallery.length > 0 && (
        <Section id="galeri">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Pengalaman klinik</Eyebrow>
                <h2 className="mt-4 max-w-[20ch] text-h2 text-forest">
                  Suasana yang tenang dan tertata.
                </h2>
              </div>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.slice(0, 4).map((img, i) => (
              <Reveal key={img.publicId} delay={i * 70}>
                <figure className="group overflow-hidden rounded-2xl border border-line">
                  <MediaFigure
                    publicId={img.publicId}
                    alt={img.alt || img.caption || "Foto klinik"}
                    width={600}
                    height={750}
                    className="aspect-4/5 w-full transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Pendekatan perawatan (alur klinis) */}
      <Section id="pendekatan" tone="alt">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>Pendekatan perawatan</Eyebrow>
              <h2 className="mt-4 max-w-[18ch] text-h2 text-forest">
                Alur yang tenang dari konsultasi hingga tindak lanjut.
              </h2>
            </div>
            <ol className="grid gap-0">
              {approachSteps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-5 border-b border-line py-4 transition-colors last:border-0 hover:bg-white/60"
                >
                  <span className="font-serif text-h3 text-forest/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-charcoal/85">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Section>

      {/* Testimoni (ULASAN DEMO) */}
      <Section id="testimoni">
        <Reveal>
          <Eyebrow>Kata pasien</Eyebrow>
          <h2 className="mt-4 max-w-[20ch] text-h2 text-forest">
            Pengalaman yang diceritakan setelah kunjungan.
          </h2>
          <p className="mt-4 max-w-prose text-small text-charcoal/60">
            Ulasan berikut adalah <strong>contoh placeholder (data demo)</strong>,
            bukan ulasan pasien nyata, dan tidak mewakili testimoni terverifikasi.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {demoTestimonials.map((t, i) => (
            <Reveal key={i} delay={Math.min(i, 3) * 70}>
              <figure className="flex h-full flex-col rounded-[1.25rem] border border-line bg-sage p-6">
                <blockquote className="flex-1 text-charcoal/85">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-forest/15 pt-4">
                  <p className="font-medium text-forest">{t.name}</p>
                  <p className="text-small text-charcoal/60">{t.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Artikel */}
      <Section id="artikel" tone="alt">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Artikel kesehatan gigi</Eyebrow>
              <h2 className="mt-4 max-w-[20ch] text-h2 text-forest">
                Catatan singkat untuk perawatan sehari-hari.
              </h2>
            </div>
            <Link
              href="/artikel"
              className="text-small font-medium text-forest underline underline-offset-4 transition-colors hover:text-charcoal"
            >
              Semua artikel
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {articles.slice(0, 2).map((article, i) => (
            <Reveal key={article.slug} delay={i * 70}>
              <Link
                href={`/artikel/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest"
              >
                <MediaFigure
                  publicId={article.coverPublicId}
                  alt={article.coverAlt ?? article.title}
                  width={800}
                  height={500}
                  className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-small uppercase tracking-[0.12em] text-charcoal/60">
                    {article.category}
                  </p>
                  <h3 className="mt-3 text-h3 text-forest">{article.title}</h3>
                  <p className="mt-3 flex-1 text-charcoal/75">{article.excerpt}</p>
                  <p className="mt-4 text-small text-charcoal/60">
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Pertanyaan umum</Eyebrow>
              <h2 className="mt-4 max-w-[16ch] text-h2 text-forest">
                Jawaban singkat sebelum Anda membuat janji.
              </h2>
            </div>
            <FaqList items={faqs.length > 0 ? faqs : fallbackFaqs} />
          </div>
        </Reveal>
      </Section>

      {/* Lokasi & kontak + peta */}
      <Section id="kontak" tone="alt">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Lokasi &amp; kontak</Eyebrow>
              <h2 className="mt-4 max-w-[18ch] text-h2 text-forest">
                Hubungi kami untuk konsultasi.
              </h2>
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
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton
                  href={heroWa}
                  className="transition-all duration-200 hover:-translate-y-0.5"
                >
                  Chat WhatsApp
                </LinkButton>
                <LinkButton href="/kontak" variant="secondary">
                  Formulir Permintaan Janji
                </LinkButton>
              </div>
            </div>
            <div className="flex flex-col self-center">
              <p className="mb-3 text-h3 text-forest">Lokasi kami</p>
              <MapEmbed
                query={settings.mapsQuery ?? settings.addressText}
                label={settings.addressText}
              />
            </div>
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
                  Siap memulai dengan konsultasi yang tenang?
                </h2>
                <p className="mt-3 max-w-prose text-ivory/80">
                  Sampaikan kebutuhan Anda melalui WhatsApp. Jadwal final
                  dikonfirmasi setelah tim klinik menindaklanjuti.
                </p>
              </div>
              <LinkButton
                href={heroWa}
                variant="secondary"
                className="shrink-0 border-ivory bg-ivory text-forest transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                Buat Janji Konsultasi
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </section>
    </PublicShell>
  );
}