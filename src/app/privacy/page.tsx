import type { Metadata } from "next";
import Link from "next/link";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi untuk situs demo Nawasena Dental Care: data yang dikumpulkan melalui formulir permintaan janji dan cara penggunaannya.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Eyebrow>Kebijakan privasi</Eyebrow>
        <h1 className="mt-4 max-w-[18ch] text-display text-forest">
          Kebijakan privasi (situs demo)
        </h1>
      </Container>

      <Section className="pt-0">
        <div className="max-w-prose space-y-5 text-charcoal/85">
          <p>
            Halaman ini adalah bagian dari situs demo Nawasena Dental Care.
            Seluruh informasi bersifat fiktif dan tidak mewakili klinik sungguhan.
          </p>

          <h2 className="text-h3 text-forest">Data yang dikumpulkan</h2>
          <p>
            Formulir permintaan janji hanya mengumpulkan informasi minimum yang
            diperlukan untuk menindaklanjuti: nama, nomor WhatsApp, layanan yang
            diminati (opsional), tanggal dan rentang waktu preferensi, serta
            catatan singkat.
          </p>

          <h2 className="text-h3 text-forest">Yang tidak kami kumpulkan</h2>
          <p>
            Kami tidak meminta diagnosis, riwayat kesehatan, atau data medis
            sensitif melalui formulir. Situs ini bukan sistem rekam medis.
          </p>

          <h2 className="text-h3 text-forest">Cara penggunaan</h2>
          <p>
            Data digunakan semata-mata untuk menghubungi Anda guna mengonfirmasi
            jadwal. Setelah permintaan ditindaklanjuti, informasi kontak dapat
            dianonimkan sesuai kebijakan retensi.
          </p>

          <h2 className="text-h3 text-forest">Pesaing pihak ketiga</h2>
          <p>
            Menekan tombol WhatsApp akan membuka aplikasi atau layanan WhatsApp
            milik pihak ketiga dan tunduk pada kebijakan privasi mereka.
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <Link
              href="/"
              className="text-small font-medium text-forest underline underline-offset-4 hover:text-charcoal"
            >
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}
