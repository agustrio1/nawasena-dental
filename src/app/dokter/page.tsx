import type { Metadata } from "next";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { MediaFigure } from "@/components/ui/media-figure";
import { Reveal } from "@/components/ui/reveal";
import { getDoctors } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tim Dokter",
  description:
    "Profil dokter Nawasena Dental Care. Data demonstrasi — kredensial sebenarnya menyusul.",
};

export default async function DoctorsPage() {
  const doctors = await getDoctors();

  return (
    <PublicShell>
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Reveal>
          <Eyebrow>Tim dokter</Eyebrow>
          <h1 className="mt-4 max-w-[18ch] text-display text-forest">
            Dokter yang menjelaskan, bukan sekadar memeriksa.
          </h1>
          <p className="mt-6 max-w-prose text-charcoal/80">
            Setiap perawatan dimulai dari komunikasi yang jelas. Berikut tim yang
            akan Anda temui.
          </p>
        </Reveal>
      </Container>

      <Section className="pt-0" tone="alt">
        <div className="grid gap-6 md:grid-cols-2">
          {doctors.map((doctor, i) => (
            <Reveal key={doctor.name} delay={Math.min(i, 3) * 70}>
              <article className="group flex h-full flex-col gap-5 rounded-[1.25rem] border border-line bg-ivory p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest sm:flex-row">
                <div className="self-start overflow-hidden rounded-2xl">
                  <MediaFigure
                    publicId={doctor.photoPublicId}
                    alt={doctor.photoAlt ?? `Foto ${doctor.name}`}
                    width={400}
                    height={400}
                    fallback="person"
                    initials={doctor.name.split(" ").slice(-1)[0].slice(0, 1)}
                    className="aspect-square w-28 shrink-0 transition-transform duration-500 group-hover:scale-[1.04] sm:w-32"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-h3 text-forest">{doctor.name}</h2>
                  <p className="mt-1 text-forest/80">{doctor.specialty}</p>
                  {doctor.education && (
                    <p className="mt-3 text-sm text-charcoal/70">
                      {doctor.education}
                    </p>
                  )}
                  {doctor.experience && (
                    <p className="mt-1 text-sm text-charcoal/70">
                      {doctor.experience}
                    </p>
                  )}
                  <p className="mt-4 text-small text-charcoal/55">
                    Data demo — profil dan kredensial akan diganti dengan data
                    dokter yang telah disetujui.
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </PublicShell>
  );
}
