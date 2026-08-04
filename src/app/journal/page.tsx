import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IMAGERY } from "@/constants/imagery";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, craftsmanship and culture from the BLA house.",
};

const ARTICLES = [
  {
    slug: "the-making-of-a-garment",
    category: "Craft",
    title: "The making of a garment",
    excerpt: "From first sketch to final stitch — a look inside how a single BLA piece comes to life.",
    image: IMAGERY.journal[0],
    date: "January 2026",
    minutes: 6,
  },
  {
    slug: "notes-on-silhouette",
    category: "Design",
    title: "Notes on silhouette",
    excerpt: "Why we obsess over shoulder lines, lengths and how a piece falls on the body.",
    image: IMAGERY.journal[1],
    date: "December 2025",
    minutes: 4,
  },
  {
    slug: "a-guide-to-fabric-care",
    category: "Care",
    title: "A guide to fabric care",
    excerpt: "Make your pieces last — simple care routines for premium cotton, jersey and knit.",
    image: IMAGERY.journal[2],
    date: "November 2025",
    minutes: 5,
  },
];

export default function JournalPage() {
  const [featured, ...rest] = ARTICLES;
  return (
    <div className="container-lux py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Journal</p>
        <h1 className="editorial-title mt-3 text-ink">The house journal</h1>
        <p className="mt-5 text-muted">
          Stories on craft, culture and the people behind the clothes.
        </p>
      </header>

      {/* Featured */}
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

      {/* Grid */}
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
