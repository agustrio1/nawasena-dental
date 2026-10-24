import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { MediaFigure } from "@/components/ui/media-figure";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { buildWhatsAppUrl } from "@/lib/appointment";
import { getArticleBySlug, getArticles, getSiteSettings } from "@/lib/content";
import { optimizeContentImages } from "@/lib/content-images";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

// Rute ini membaca URL data (params) saat render. Dalam cacheComponents,
// tandai sebagai blocking route agar tidak memaksa shell instant menunggu params.
export const instant = false;

// Helper ekstraksi sinyal E-E-A-T dari JSON-LD artikel.
function personField(value: unknown, key: string): string | null {
  if (value && typeof value === "object") {
    const v = (value as Record<string, unknown>)[key];
    return typeof v === "string" ? v : null;
  }
  return null;
}

function strField(
  obj: Record<string, unknown> | null | undefined,
  key: string
): string | null {
  const v = obj?.[key];
  return typeof v === "string" ? v : null;
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const [article, settings, allArticles] = await Promise.all([
    getArticleBySlug(slug),
    getSiteSettings(),
    getArticles(),
  ]);

  if (!article) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

  const jsonLd: Record<string, unknown> =
    article.schemaJson ?? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.seoDescription ?? article.excerpt,
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
      author: { "@type": "Organization", name: "Nawasena Dental Care" },
      publisher: { "@type": "Organization", name: "Nawasena Dental Care" },
      mainEntityOfPage: `${siteUrl}/artikel/${article.slug}`,
      ...(article.coverPublicId
        ? { image: buildCloudinaryUrl(article.coverPublicId, { width: 1200 }) }
        : {}),
    };

  // Sinyal penulis & peninjau (E-E-A-T) untuk tampilan.
  const authorName =
    personField(article.schemaJson?.author, "name") ?? "Nawasena Dental Care";
  const authorJob = personField(article.schemaJson?.author, "jobTitle");
  const reviewerName = personField(article.schemaJson?.reviewedBy, "name");
  const reviewerJob = personField(article.schemaJson?.reviewedBy, "jobTitle");
  const dateModified = strField(article.schemaJson, "dateModified");
  const lastReviewed = strField(article.schemaJson, "lastReviewed");

  const publishedLabel = formatDate(article.publishedAt);
  const updatedLabel = dateModified ? formatDate(dateModified) : null;

  const waHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Halo, saya ingin bertanya setelah membaca artikel "${article.title}".`
  );

  const related = allArticles
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const aMatch = a.category === article.category ? 1 : 0;
      const bMatch = b.category === article.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 3);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header editorial */}
      <Container className="pb-8 pt-14 md:pt-20">
        <Link
          href="/artikel"
          className="text-small font-medium text-forest underline underline-offset-4 hover:text-charcoal"
        >
          ← Semua artikel
        </Link>
        <div className="mt-6">
          <Eyebrow>{article.category}</Eyebrow>
        </div>
        <h1 className="mt-4 max-w-[22ch] text-balance text-display text-forest">
          {article.title}
        </h1>
        <p className="mt-5 max-w-prose text-h3 font-normal text-forest">
          {article.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-small text-charcoal/60">
          <span>
            Oleh <span className="text-forest/80">{authorName}</span>
          </span>
          <span aria-hidden>·</span>
          <span>{publishedLabel}</span>
          {updatedLabel && updatedLabel !== publishedLabel && (
            <>
              <span aria-hidden>·</span>
              <span>Diperbarui {updatedLabel}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{readingTime(article.content)} mnt baca</span>
        </div>

        {reviewerName && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-sage bg-sage px-3.5 py-1.5 text-small text-forest">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Ditinjau oleh {reviewerName}
            {reviewerJob ? ` — ${reviewerJob}` : ""}
          </div>
        )}
      </Container>

      {/* Sampul (hanya bila ada gambar, agar blog tetap bersih tanpa kotak kosong) */}
      {article.coverPublicId && (
        <Container className="pb-4">
          <div className="overflow-hidden rounded-3xl border border-line">
            <MediaFigure
              publicId={article.coverPublicId}
              alt={article.coverAlt ?? article.title}
              width={1280}
              height={560}
              className="aspect-16/7 w-full"
              fallback="tooth"
              priority
            />
          </div>
        </Container>
      )}

      {/* Isi + sidebar */}
      <Section className="pt-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <article className="min-w-0 text-body text-charcoal/85">
            <div
              className="rich-content"
              dangerouslySetInnerHTML={{
                __html: optimizeContentImages(article.content),
              }}
            />
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Kartu penulis & peninjau (E-E-A-T) */}
            <div className="rounded-3xl border border-line bg-white p-6">
              <p className="text-small uppercase tracking-[0.12em] text-forest/70">
                Tentang penulis
              </p>
              <p className="mt-3 font-medium text-forest">{authorName}</p>
              {authorJob && (
                <p className="mt-1 text-small text-charcoal/70">{authorJob}</p>
              )}

              {reviewerName && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-small uppercase tracking-[0.12em] text-forest/70">
                    Ditinjau oleh
                  </p>
                  <p className="mt-3 font-medium text-forest">{reviewerName}</p>
                  {reviewerJob && (
                    <p className="mt-1 text-small text-charcoal/70">
                      {reviewerJob}
                    </p>
                  )}
                  {lastReviewed && (
                    <p className="mt-3 text-small text-charcoal/60">
                      Terakhir ditinjau {formatDate(lastReviewed)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* CTA janji */}
            <div className="rounded-3xl border border-line bg-forest p-6 text-ivory">
              <h2 className="text-h3">Punya pertanyaan?</h2>
              <p className="mt-3 text-sm text-ivory/85">
                Konten ini edukatif dan bukan pengganti pemeriksaan. Konsultasikan
                kondisi Anda dengan tim kami.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <LinkButton
                  href={waHref}
                  variant="light"
                  className="w-full justify-center"
                >
                  Chat WhatsApp
                </LinkButton>
                <LinkButton
                  href="/kontak"
                  variant="outlineLight"
                  className="w-full justify-center"
                >
                  Ajukan Janji
                </LinkButton>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {/* Artikel terkait */}
      {related.length > 0 && (
        <Section tone="alt">
          <Eyebrow>Baca juga</Eyebrow>
          <h2 className="mt-4 max-w-[24ch] text-h2 text-forest">
            Artikel terkait
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {related.map((a, i) => (
              <Reveal key={a.slug} delay={Math.min(i, 3) * 70}>
                <Link
                  href={`/artikel/${a.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest"
                >
                  <div className="overflow-hidden">
                    <MediaFigure
                      publicId={a.coverPublicId}
                      alt={a.coverAlt ?? a.title}
                      width={640}
                      height={400}
                      className="aspect-16/10 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                      fallback="tooth"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-small uppercase tracking-[0.12em] text-forest/60">
                      {a.category}
                    </p>
                    <h3 className="mt-2 text-h3 text-forest">{a.title}</h3>
                    <p className="mt-3 flex-1 text-charcoal/75">{a.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </PublicShell>
  );
}
