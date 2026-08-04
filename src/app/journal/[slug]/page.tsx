import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { IMAGERY } from "@/constants/imagery";

const ARTICLES: Record<string, { category: string; title: string; date: string; image: string; body: string[] }> = {
  "the-making-of-a-garment": {
    category: "Craft",
    title: "The making of a garment",
    date: "January 2026",
    image: IMAGERY.journal[0],
    body: [
      "Every BLA piece begins with a mood board, not a sketch. We start with a feeling — a season, a texture, a silhouette we cannot stop thinking about — and let the fabric do the talking.",
      "Fabrics are sampled twice before a single cut. We wear-test every wash, checking how the hand feel changes after twenty cycles, because a garment should only get better with age.",
      "Pattern cutting happens by hand in our studio. The grain, the drape, the fall of a seam — these details are decided by eye and touch, not just by software.",
      "The result is a piece produced in small numbers, finished by hand, and released once. When a run is gone, it is gone — that is the point.",
    ],
  },
  "notes-on-silhouette": {
    category: "Design",
    title: "Notes on silhouette",
    date: "December 2025",
    image: IMAGERY.journal[1],
    body: [
      "A great piece of clothing is not seen — it is felt. The way a shoulder seam sits, the length of a hem, the space a garment leaves around the body.",
      "We build our silhouettes around proportion rather than trend. An oversized piece only works if it is cut deliberately; a slim piece only works if it moves.",
      "Each season we return to the same question: what does the body need right now? The answer shapes everything from fabric weight to pocket placement.",
    ],
  },
  "a-guide-to-fabric-care": {
    category: "Care",
    title: "A guide to fabric care",
    date: "November 2025",
    image: IMAGERY.journal[2],
    body: [
      "The best way to make a garment last is to wash it less. Most pieces only need a wash every four to five wears.",
      "Wash in cold water on a gentle cycle and hang to dry. Heat is the biggest enemy of natural fibres — it shrinks, fades and breaks down elasticity.",
      "For sweats and jersey, wash inside out to protect the print. For heavyweight cotton, a steamer beats an iron and is gentler on the fabric.",
      "Follow the care label — we print our recommended routine on every garment.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) return { title: "Journal" };
  return { title: article.title, description: article.body[0] };
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();

  return (
    <article className="container-lux py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ label: "Journal", href: "/journal" }, { label: article.category }]} />
        <header className="mt-8">
          <p className="eyebrow">{article.category} · {article.date}</p>
          <h1 className="editorial-title mt-4 text-ink">{article.title}</h1>
        </header>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-mist">
          <Image src={article.image} alt={article.title} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="mt-10 space-y-6">
          {article.body.map((paragraph, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink/80 md:text-base md:leading-loose">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-14 border-t border-line pt-8">
          <Link href="/journal" className="text-sm text-ink underline-offset-2 hover:underline">
            ← Back to journal
          </Link>
        </div>
      </div>
    </article>
  );
}
