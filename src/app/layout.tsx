import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

// Shop lettering: characterful, with an optical-size axis so headlines and labels both hold up.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap", axes: ["opsz"] });
// Everything you read.
const text = Instrument_Sans({ subsets: ["latin"], variable: "--font-text", display: "swap" });
// Catalogue numbers, keys and code.
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-mono", display: "swap" });

const description =
  "Ved S. Chauhan, software engineer and founder of SNOWBROS. Walk into a record shop where every record is a shipped project: a boutique's point of sale, a multi-currency ledger, a Rust static analyzer, a drug-repurposing research platform, and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Ved Chauhan · The Recordverse", template: "%s · Ved Chauhan" },
  description,
  authors: [{ name: SITE.person, url: SITE.url }],
  creator: SITE.person,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ved Chauhan",
    title: "Ved Chauhan · The Recordverse",
    description,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Ved Chauhan, software engineer" }],
  },
  twitter: { card: "summary_large_image", title: "Ved Chauhan · The Recordverse", description, images: ["/api/og"] },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6e8" },
    { media: "(prefers-color-scheme: dark)", color: "#17132f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
