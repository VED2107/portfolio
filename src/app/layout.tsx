import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteStrip } from "@/components/SiteStrip";
import { CommandPalette } from "@/components/CommandPalette";
import { Secrets } from "@/components/Secrets";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "VED.EXE · Ved S. Chauhan, software engineer",
    template: "%s · VED.EXE",
  },
  description:
    "Ved S. Chauhan builds developer tools and full-stack products that ship: a Rust static analyzer, a multi-currency ledger, a boutique's point of sale. Founder of SNOWBROS.",
  authors: [{ name: SITE.person, url: SITE.url }],
  creator: SITE.person,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE.name,
    title: "VED.EXE · Ved S. Chauhan",
    description: "Software engineer. Developer tools and full-stack products, filed with their evidence.",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "VED.EXE, the filing of Ved S. Chauhan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VED.EXE · Ved S. Chauhan",
    description: "Software engineer. Developer tools and full-stack products, filed with their evidence.",
    images: ["/api/og"],
  },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef0f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1114" },
  ],
};

// Runs before paint: marks JS as available (so entrance/draw states may hide first)
// and restores the chosen theme and the secret mode without a flash.
const boot = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('ved-theme');if(t==='light'||t==='dark')d.dataset.theme=t;if(localStorage.getItem('ved-mode')==='blueprint')d.dataset.mode='blueprint';}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:text-[var(--paper)]"
        >
          Skip to content
        </a>
        <SiteStrip />
        {children}
        <CommandPalette />
        <Secrets />
      </body>
    </html>
  );
}
