import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { getArticleBySlug, getArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

type Props = { params: Promise<{ slug: string }> };

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
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

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

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="pb-10 pt-14 md:pb-12 md:pt-20">
        <Link
          href="/artikel"
          className="text-small font-medium text-forest underline underline-offset-4 hover:text-charcoal"
        >
          ← Semua artikel
        </Link>
        <div className="mt-6">
          <Eyebrow>{article.category}</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-display text-forest">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-charcoal/60">
            <span>{formatDate(article.publishedAt)}</span>
            <span aria-hidden>·</span>
            <span>
              {article.isProfessionallyReviewed
                ? "Ditinjau secara profesional"
                : "Belum ditinjau profesional"}
            </span>
          </div>
        </div>
      </Container>

      <Section className="pt-0">
        <article className="max-w-prose text-body text-charcoal/85">
          <p className="text-h3 font-normal text-forest">{article.excerpt}</p>
          {/* Konten HTML dari rich text editor (karangan admin, sumber tepercaya). */}
          <div
            className="rich-content mt-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <aside className="mt-10 max-w-prose rounded-3xl border border-line bg-sage p-6">
          <p className="text-small uppercase tracking-[0.12em] text-forest/70">
            Catatan
          </p>
          <p className="mt-3 text-sm text-charcoal/85">
            Konten ini bersifat edukatif secara umum dan bukan pengganti
            diagnosis atau konsultasi dengan dokter gigi. Konsultasikan kondisi
            Anda secara langsung sebelum mengambil keputusan perawatan.
          </p>
        </aside>

        <div className="mt-10 flex flex-wrap gap-4">
          <LinkButton href="/kontak">Ajukan Pertanyaan / Janji</LinkButton>
          <LinkButton href="/layanan" variant="secondary">
            Lihat Layanan
          </LinkButton>
        </div>
      </Section>
    </PublicShell>
  );
}
