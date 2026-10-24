import type { Metadata } from "next";
import Link from "next/link";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { getArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Catatan edukatif seputar kebersihan gigi, perawatan, ortodonti, dan kesehatan gigi keluarga dari Nawasena Dental Care.",
};

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <PublicShell>
      <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
        <Eyebrow>Artikel</Eyebrow>
        <h1 className="mt-4 max-w-[16ch] text-display text-forest">
          Catatan untuk perawatan gigi sehari-hari.
        </h1>
        <p className="mt-6 max-w-prose text-charcoal/80">
          Konten edukatif bersifat umum dan tidak menggantikan konsultasi dengan
          dokter gigi.
        </p>
      </Container>

      <Section className="pt-0">
        {articles.length === 0 ? (
          <p className="text-charcoal/70">Belum ada artikel yang dipublikasikan.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/artikel/${article.slug}`}
                  className="group grid gap-3 py-8 transition-colors hover:bg-white/60 md:grid-cols-[200px_1fr] md:gap-8 md:px-4"
                >
                  <div className="text-small uppercase tracking-[0.12em] text-forest/70">
                    <p>{article.category}</p>
                    <p className="mt-2 normal-case tracking-normal text-charcoal/60">
                      {formatDate(article.publishedAt)}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-h3 text-forest">{article.title}</h2>
                    <p className="mt-3 max-w-prose text-charcoal/75">
                      {article.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-small font-medium text-forest">
                      Baca artikel
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <LinkButton href="/" variant="secondary">
            Kembali ke Beranda
          </LinkButton>
        </div>
      </Section>
    </PublicShell>
  );
}
