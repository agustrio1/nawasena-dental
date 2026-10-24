import type { Metadata } from "next";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Tentang Klinik",
  description:
    "Filosofi pelayanan, pendekatan perawatan, dan komitmen Nawasena Dental Care kepada pasien.",
};

const values = [
  [
    "Komunikasi yang jelas",
    "Kami menjelaskan kondisi, pilihan, dan tahapan perawatan dengan bahasa yang mudah dipahami, sehingga Anda dapat memutuskan dengan tenang.",
  ],
  [
    "Perencanaan yang cermat",
    "Setiap rencana perawatan disusun berdasarkan hasil pemeriksaan, bukan asumsi. Ketersediaan layanan bergantung pada dokter dan fasilitas klinik.",
  ],
  [
    "Kenyamanan pasien",
    "Kunjungan dirancang agar tidak terburu-buru, dengan perhatian pada kenyamanan dan rasa hormat selama proses perawatan.",
  ],
];

export default function AboutPage() {
  return (
    <PublicShell>
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Eyebrow>Tentang klinik</Eyebrow>
        <h1 className="mt-4 max-w-[16ch] text-display text-forest">
          Perawatan gigi yang direncanakan dengan cermat.
        </h1>
        <p className="mt-6 max-w-prose text-charcoal/80">
          Nawasena Dental Care dibangun di atas keyakinan bahwa perawatan yang
          baik dimulai dari pemahaman bersama. Kami memprioritaskan pemeriksaan
          yang teliti, penjelasan yang jujur, dan rencana perawatan yang
          disesuaikan dengan kebutuhan masing-masing pasien.
        </p>
      </Container>

      <Section tone="alt" className="pt-0">
        <h2 className="text-h2 text-forest">Filosofi pelayanan</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {values.map(([title, copy]) => (
            <div key={title} className="border-t border-line pt-6">
              <h3 className="text-h3 text-forest">{title}</h3>
              <p className="mt-3 text-charcoal/75">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="rounded-3xl border border-line bg-sage p-8">
            <p className="text-small uppercase tracking-[0.12em] text-forest/70">
              Pendekatan
            </p>
            <h2 className="mt-4 text-h2 text-forest">
              Dari konsultasi awal hingga tindak lanjut.
            </h2>
          </div>
          <div className="space-y-4 text-charcoal/80">
            <p>
              Alur kami sederhana: konsultasi awal, pemeriksaan, penjelasan
              kondisi beserta pilihan perawatan, persetujuan rencana, lalu tindak
              lanjut sesuai kebutuhan.
            </p>
            <p>
              Kami tidak menjanjikan hasil tertentu. Pilihan perawatan ditentukan
              bersama setelah dokter menilai kondisi Anda secara langsung.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <LinkButton href="/kontak">Buat Janji Konsultasi</LinkButton>
          <LinkButton href="/layanan" variant="secondary">
            Lihat Layanan
          </LinkButton>
        </div>
      </Section>
    </PublicShell>
  );
}
