"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { IMAGERY } from "@/constants/imagery";
import { useHomepage } from "@/hooks/use-catalog";

interface HeroSlide {
  id: string;
  image: string;
  headline: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
}

const FALLBACK_SLIDES: HeroSlide[] = [
  { id: "1", image: "/Slide1.png", headline: "NOIR Drop 001", subtitle: "The inaugural capsule from the BLA NOIR line.", ctaText: "Shop the drop", ctaUrl: "/collections/noir-drop-001" },
  { id: "2", image: "/slide2.png", headline: "Quietly Considered", subtitle: "Heavyweight fabrics, precise silhouettes.", ctaText: "Explore", ctaUrl: "/shop" },
  { id: "3", image: IMAGERY.hero[2], headline: "Made to Endure", subtitle: "Limited-edition pieces, crafted in small batches.", ctaText: "Discover", ctaUrl: "/about" },
];

function toSlides(data?: unknown): HeroSlide[] {
  try {
    const hero = (data as { hero?: unknown[] })?.hero;
    if (!Array.isArray(hero) || hero.length === 0) return FALLBACK_SLIDES;
    const slides = hero
      .flatMap((s) => {
        const section = s as {
          id?: string;
          title?: string;
          subtitle?: string;
          content?: { ctaText?: string; ctaUrl?: string; mediaUrl?: string; images?: string[] };
        };
        const base = {
          headline: section.title ?? "",
          subtitle: section.subtitle ?? undefined,
          ctaText: section.content?.ctaText,
          ctaUrl: section.content?.ctaUrl,
        };
        if (!base.headline) return [];
        const images = (section.content?.images ?? [])
          .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
          .map((u) => u.trim());
        const media = typeof section.content?.mediaUrl === "string" && section.content.mediaUrl.trim() ? section.content.mediaUrl.trim() : null;
        const sourceImages = [...new Set([...(media ? [media] : []), ...images])];
        if (sourceImages.length === 0) sourceImages.push(IMAGERY.hero[0]);
        return sourceImages.map((image, i) => ({
          id: `${(s as { id?: string }).id ?? Math.random().toString(36)}-${i}`,
          image,
          ...base,
        }));
      })
      .filter((s) => s.image);
    return slides.length > 0 ? slides : FALLBACK_SLIDES;
  } catch {
    return FALLBACK_SLIDES;
  }
}

export function Hero() {
  const { data } = useHomepage();
  const slides = toSlides(data);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => {
    setDirection(1);
    go(index + 1);
  }, [go, index]);

  const prev = useCallback(() => {
    setDirection(-1);
    go(index - 1);
  }, [go, index]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const pause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const resume = () => {
    if (slides.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
  };

  const slide = slides[index] ?? slides[0];

  return (
    <section
      className="relative w-full overflow-hidden bg-ink h-[60vh] min-h-[420px] sm:h-[72vh] md:h-[70vh] lg:h-[85vh] lg:min-h-[560px] xl:h-[92vh]"
      aria-label="Featured"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ opacity: 0, x: direction >= 0 ? "100%" : "-100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction >= 0 ? "-100%" : "100%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image src={slide.image} alt={slide.headline} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-ink/35" />
        </motion.div>
      </AnimatePresence>

      <div className="container-lux relative z-10 flex h-full flex-col justify-end pb-24">
        <motion.div
          key={`${slide.id}-copy`}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-background"
        >
          <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-background/70">New Collection</p>
          <h1 className="editorial-hero text-background">{slide.headline}</h1>
          {slide.subtitle ? <p className="mt-6 max-w-md text-base leading-relaxed text-background/80">{slide.subtitle}</p> : null}
          {slide.ctaUrl ? (
            <Link
              href={slide.ctaUrl}
              className="group mt-10 inline-flex items-center gap-3 border-b border-background/60 pb-2 text-xs uppercase tracking-[0.22em] text-background transition-colors hover:border-background"
            >
              {slide.ctaText ?? "Shop now"}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : null}
        </motion.div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center size-11 border border-background/30 text-background backdrop-blur transition-colors hover:bg-background hover:text-ink md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center size-11 border border-background/30 text-background backdrop-blur transition-colors hover:bg-background hover:text-ink md:flex"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-10 right-8 z-10 flex items-center gap-3">
            <span className="text-[11px] tabular-nums text-background/70">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-px w-10 transition-all duration-500 ${i === index ? "bg-background" : "bg-background/30 hover:bg-background/60"}`}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
