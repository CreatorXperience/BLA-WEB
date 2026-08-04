"use client";

import type { ReactNode } from "react";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="container-lux flex min-h-[70vh] items-center justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="editorial-title mt-3 text-ink">{title}</h1>
          {subtitle ? <p className="mt-4 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
        </header>
        {children}
        {footer ? <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </div>
  );
}
