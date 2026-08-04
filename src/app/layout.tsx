import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "@/styles/globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/providers/toaster";
import { StoreShell } from "@/components/layout/store-shell";
import { SITE } from "@/constants/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} — Luxury Streetwear`,
      template: `%s — ${SITE.name}`,
    },
    description:
      "BLA — Best Life Ahead. A premium luxury streetwear house. Limited-edition apparel, quietly considered.",
    keywords: ["streetwear", "luxury fashion", "BLA", "Best Life Ahead", "premium apparel", "limited edition"],
    openGraph: {
      type: "website",
      locale: "en_NG",
      url: SITE.url,
      siteName: SITE.name,
      title: `${SITE.name} — Luxury Streetwear`,
      description: "Best Life Ahead — limited-edition luxury streetwear, quietly considered.",
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE.name} — Luxury Streetwear`,
      description: "Best Life Ahead — limited-edition luxury streetwear, quietly considered.",
    },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${instrument.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <StoreShell>{children}</StoreShell>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
