import type { Metadata } from "next";
import Link from "next/link";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { MediaFigure } from "@/components/ui/media-figure";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getArticles } from "@/lib/content";
import type { ArticleContent } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Catatan edukatif seputar kebersihan gigi, perawatan, ortodonti, dan kesehatan gigi keluarga dari Nawasena Dental Care.",
};

// Ekstraksi sinyal penulis dari JSON-LD (schemaJson) artikel.
function personName(value: unknown): string | null {
  if (value && typeof value === "object") {
    const name = (value as Record<string, unknown>)["name"];
    return typeof name === "string" ? name : null;
  }
  return null;
}

// Estimasi durasi baca (±200 kata/menit) dari teks HTML yang dibersihkan.
function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-line bg-ivory px-3 py-1 text-small uppercase tracking-[0.12em] text-forest/70">
      {label}
    </span>
  );
}

function Byline({ article }: { article: ArticleContent }) {
  const author = personName(article.schemaJson?.author) ?? "Nawasena Dental Care";
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-charcoal/60">
      <span>{formatDate(article.publishedAt)}</span>
      <span aria-hidden>·</span>
      <span>{readingTime(article.content)} mnt baca</span>
      <span aria-hidden>·</span>
      <span>
        Oleh <span className="text-forest/80">{author}</span>
      </span>
    </div>
  );
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  const [lead, ...rest] = articles;

  return (
    <PublicShell>
      <Container className="pb-6 pt-14 md:pt-20">
        <Reveal>
          <Eyebrow>Artikel kesehatan gigi</Eyebrow>
          <h1 className="mt-4 max-w-[16ch] text-display text-forest">
            Catatan untuk perawatan gigi sehari-hari.
          </h1>
          <p className="mt-6 max-w-prose text-charcoal/80">
            Konten edukatif bersifat umum, disusun dan ditinjau oleh tim kami,
            serta tidak menggantikan konsultasi dengan dokter gigi.
          </p>
        </Reveal>
      </Container>

      {articles.length === 0 ? (
        <Container className="pb-16">
          <p className="text-charcoal/70">
            Belum ada artikel yang dipublikasikan.
          </p>
        </Container>
      ) : (
        <>
          {/* Artikel unggulan */}
          {lead && (
            <Container className="pb-4">
              <Reveal>
                <Link
                  href={`/artikel/${lead.slug}`}
                  className="group grid gap-0 overflow-hidden rounded-3xl border border-line bg-white transition-colors duration-200 hover:border-forest md:grid-cols-2"
                >
                  <div className="relative min-h-64 overflow-hidden bg-ivory md:min-h-full">
                    <MediaFigure
                      publicId={lead.coverPublicId}
                      alt={lead.coverAlt ?? lead.title}
                      width={1000}
                      height={800}
                      className="h-full w-full"
                      fallback="tooth"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-7 md:p-10">
                    <CategoryPill label={lead.category} />
                    <h2 className="mt-4 text-balance text-h2 text-forest">
                      {lead.title}
                    </h2>
                    <p className="mt-4 max-w-prose text-charcoal/75">
                      {lead.excerpt}
                    </p>
                    <Byline article={lead} />
                    <span className="mt-6 inline-flex items-center gap-1 text-small font-medium text-forest">
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
              </Reveal>
            </Container>
          )}

          {/* Daftar lainnya */}
          {rest.length > 0 && (
            <Section tone="alt">
              <Eyebrow>Artikel lainnya</Eyebrow>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, i) => (
                  <Reveal key={article.slug} delay={Math.min(i, 5) * 70}>
                    <Link
                      href={`/artikel/${article.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest"
                    >
                      <div className="overflow-hidden">
                        <MediaFigure
                          publicId={article.coverPublicId}
                          alt={article.coverAlt ?? article.title}
                          width={640}
                          height={400}
                          className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                          fallback="tooth"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <CategoryPill label={article.category} />
                        <h3 className="mt-3 text-h3 text-forest">
                          {article.title}
                        </h3>
                        <p className="mt-3 flex-1 text-charcoal/75">
                          {article.excerpt}
                        </p>
                        <Byline article={article} />
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      <Section tone={rest.length > 0 ? "default" : "alt"}>
        <div className="rounded-3xl border border-line bg-forest p-8 md:p-12">
          <h2 className="max-w-[22ch] font-serif text-h2 text-ivory">
            Masih ada yang ingin ditanyakan?
          </h2>
          <p className="mt-4 max-w-prose text-ivory/85">
            Artikel membantu Anda memahami opsinya, tetapi kondisi setiap orang
            berbeda. Konsultasikan kebutuhan Anda dengan tim kami.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href="/kontak" variant="light">
              Ajukan Pertanyaan / Janji
            </LinkButton>
            <LinkButton href="/" variant="outlineLight">
              Kembali ke Beranda
            </LinkButton>
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}
