"use client";

import Image from "next/image";
import Link from "next/link";
import { IMAGERY } from "@/constants/imagery";
import { useContentPage } from "@/hooks/use-catalog";
import type { JournalContent } from "@/types/cms";

const FALLBACK: JournalContent = {
  eyebrow: "Journal",
  title: "The house journal",
  intro: "Stories on craft, culture and the people behind the clothes.",
  articles: [
    {
      slug: "the-making-of-a-garment",
      category: "Craft",
      title: "The making of a garment",
      excerpt: "From first sketch to final stitch — a look inside how a single BLA piece comes to life.",
      image: IMAGERY.journal[0],
      date: "January 2026",
      minutes: 6,
      body: [
        "Every BLA piece begins with a mood board, not a sketch. We start with a feeling — a season, a texture, a silhouette we cannot stop thinking about — and let the fabric do the talking.",
        "Fabrics are sampled twice before a single cut. We wear-test every wash, checking how the hand feel changes after twenty cycles, because a garment should only get better with age.",
        "Pattern cutting happens by hand in our studio. The grain, the drape, the fall of a seam — these details are decided by eye and touch, not just by software.",
        "The result is a piece produced in small numbers, finished by hand, and released once. When a run is gone, it is gone — that is the point.",
      ],
    },
    {
      slug: "notes-on-silhouette",
      category: "Design",
      title: "Notes on silhouette",
      excerpt: "Why we obsess over shoulder lines, lengths and how a piece falls on the body.",
      image: IMAGERY.journal[1],
      date: "December 2025",
      minutes: 4,
      body: [
        "A great piece of clothing is not seen — it is felt. The way a shoulder seam sits, the length of a hem, the space a garment leaves around the body.",
        "We build our silhouettes around proportion rather than trend. An oversized piece only works if it is cut deliberately; a slim piece only works if it moves.",
        "Each season we return to the same question: what does the body need right now? The answer shapes everything from fabric weight to pocket placement.",
      ],
    },
    {
      slug: "a-guide-to-fabric-care",
      category: "Care",
      title: "A guide to fabric care",
      excerpt: "Make your pieces last — simple care routines for premium cotton, jersey and knit.",
      image: IMAGERY.journal[2],
      date: "November 2025",
      minutes: 5,
      body: [
        "The best way to make a garment last is to wash it less. Most pieces only need a wash every four to five wears.",
        "Wash in cold water on a gentle cycle and hang to dry. Heat is the biggest enemy of natural fibres — it shrinks, fades and breaks down elasticity.",
        "For sweats and jersey, wash inside out to protect the print. For heavyweight cotton, a steamer beats an iron and is gentler on the fabric.",
        "Follow the care label — we print our recommended routine on every garment.",
      ],
    },
  ],
};

export function JournalContent() {
  const { data } = useContentPage<JournalContent>("journal", FALLBACK);
  const content = data ?? FALLBACK;
  const [featured, ...rest] = content.articles.length > 0 ? content.articles : FALLBACK.articles;

  return (
    <div className="container-lux py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 className="editorial-title mt-3 text-ink">{content.title}</h1>
        <p className="mt-5 text-muted">{content.intro}</p>
      </header>

      <Link href={`/journal/${featured.slug}`} className="group mt-12 grid gap-8 border border-line md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-mist">
          <Image src={featured.image} alt={featured.title} fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12">
          <p className="eyebrow">{featured.category} · {featured.date}</p>
          <h2 className="editorial-title mt-4 text-ink">{featured.title}</h2>
          <p className="mt-5 text-sm leading-relaxed text-muted">{featured.excerpt}</p>
          <p className="mt-6 text-xs text-muted">{featured.minutes} min read</p>
        </div>
      </Link>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {rest.map((article) => (
          <Link key={article.slug} href={`/journal/${article.slug}`} className="group">
            <div className="relative aspect-[16/10] overflow-hidden bg-mist">
              <Image src={article.image} alt={article.title} fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="eyebrow mt-6">{article.category} · {article.date}</p>
            <h2 className="mt-3 text-xl text-ink">{article.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{article.excerpt}</p>
            <p className="mt-4 text-xs text-muted">{article.minutes} min read</p>
          </Link>
        ))}
      </div>
    </div>
  );
}