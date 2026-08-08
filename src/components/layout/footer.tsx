"use client";

import { useState, type FormEvent, type SVGProps } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Mail } from "lucide-react";
import { FOOTER_LINKS } from "@/constants/nav";
import { SITE } from "@/constants/site";

const Instagram = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsApp = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.4-1.3l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.7 1-.3.2-.5.1a6.9 6.9 0 0 1-2.1-1.3 7.6 7.6 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5.3-.4a.4.4 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5.2 5.2 0 0 0 1 2.7 11.5 11.5 0 0 0 4.4 3.9 5 5 0 0 0 3 .9h.3a3.4 3.4 0 0 0 1.9-1c.3-.4.5-.8.6-1.1 0-.3 0-.4-.3-.5Z" />
  </svg>
);

const Snapchat = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2.6c2.7 0 4.1 1.5 4.5 3.4.1.6.2 1.6.2 2.6.6.1 1.3.4 1.8.9.3.3.3.4 0 .6l-.3.3c-.3.3-.7.6-1 .9v.1c.1.3.4.5.8.6.5.2 1.3.3 1.7.3.3.1.4.2.2.5l-.3.5c-.6.8-1.6 1.2-2.6 1.1l.1.7c0 .9-.5 1.7-1.6 2.6-.5.4-1.1.6-1.7.6h-.5c-.4 0-.8-.2-1.2-.4-.6-.4-1.1-.8-1.7-1.4-.6.5-1.2.9-1.8 1.3-.4.2-.8.4-1.3.4h-.5c-1.2 0-2.3-.6-3-1.4-.5-.6-.8-1.3-.9-2.2-.1-.5-.1-.6-.3-.7-.4-.1-1.5-.3-1.9-1-.1-.2-.1-.5.1-.6l.2-.2.9-.2c.4-.2.9-.4 1.2-.7.1-.1.2-.2.2-.4v-.1c-.3-.3-.7-.6-1-1l-.3-.4c-.2-.4 0-.6.2-.6.5-.1 1-.3 1.6-.5.3-1.2.3-2.9.2-3.5C7.9 4.1 9.3 2.6 12 2.6Z" />
  </svg>
);

const TikTok = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden {...props}>
    <path d="M16.6 5.8c-.7-.8-1.2-1.8-1.3-3h-2.7v12.2c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .6.1.9.2V9.4c-.3 0-.6-.1-.9-.1-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2 5.2-2.3 5.2-5.2V9.9c1.1.8 2.4 1.2 3.8 1.2V8.4c-.8 0-1.5-.2-2.2-.6 0 0 0 0-.3-.2Z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-line bg-mist/40">
      <Newsletter />
      <div className="container-lux grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Link href="/" aria-label="BLA — home" className="inline-block">
            <Image
              src="/BLA.png"
              alt="BLA"
              width={1536}
              height={1024}
              className="h-10 w-auto"
              sizes="200px"
            />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
            {SITE.tagline} Limited-edition pieces, crafted to endure.
          </p>
          <div className="mt-8 flex gap-3">
            {[
              { Icon: WhatsApp, href: SITE.whatsapp, label: "WhatsApp" },
              { Icon: Snapchat, href: SITE.snapchat, label: "Snapchat" },
              { Icon: TikTok, href: SITE.tiktok, label: "TikTok" },
              { Icon: Instagram, href: SITE.instagram, label: "Instagram" },
              { Icon: Mail, href: `mailto:${SITE.email}`, label: "Email" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-10 items-center justify-center border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-background"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_LINKS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="text-[11px] uppercase tracking-[0.22em] text-muted">{col.title}</h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink/80 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-lux flex flex-col items-center justify-between gap-6 border-t border-line py-8 md:flex-row">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
        <div className="flex gap-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{SITE.country} · {SITE.currency}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:text-muted"
          >
            Back to top <ArrowUp className="size-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("success");
    setEmail("");
  };

  return (
    <div className="border-b border-line bg-mist">
      <div className="container-lux flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
        <div>
          <h3 className="editorial-title text-ink">Join the list</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            Early access to new drops, private sales and stories from the house.
          </p>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3">
          <div className="flex w-full gap-3">
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 flex-1 border border-ink/20 bg-transparent px-4 text-sm focus-visible:border-ink focus-visible:outline-none"
            />
            <button
              type="submit"
              className="h-12 bg-ink px-7 text-xs uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/90"
            >
              Subscribe
            </button>
          </div>
          {status === "success" ? (
            <p className="text-xs uppercase tracking-[0.16em] text-ink">Thanks — you are on the list.</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}