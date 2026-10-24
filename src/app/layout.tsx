import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./store.css";
import "./crate.css";
import "./film.css";
import "./room.css";
import "./cinema.css";
import "./records-room.css";
import "./catalogue.css";
import "./counter.css";
import "./counter-scene.css";
import "./pay.css";
import "./pages.css";
import { SITE } from "@/lib/site";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SmoothScroll } from "@/components/shop/SmoothScroll";
import { CursorLabel } from "@/components/shop/CursorLabel";
import { CatalogTerminal } from "@/components/shop/CatalogTerminal";
import { Notices } from "@/components/shop/Notices";
import { ClosingTime } from "@/components/shop/ClosingTime";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

const description =
  "Ved S. Chauhan, software engineer and founder of SNOWBROS. A record and film shop that only stocks what he built: a Rust static analyzer, a multi-currency ledger, a boutique's point of sale, and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "VED — Records & Film · Ved S. Chauhan, software engineer",
    template: "%s · VED Records & Film",
  },
  description,
  authors: [{ name: SITE.person, url: SITE.url }],
  creator: SITE.person,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "VED — Records & Film",
    title: "VED — Records & Film",
    description,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "VED Records & Film, Ved S. Chauhan" }],
  },
  twitter: { card: "summary_large_image", title: "VED — Records & Film", description, images: ["/api/og"] },
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
    { media: "(prefers-color-scheme: light)", color: "#ece6da" },
    { media: "(prefers-color-scheme: dark)", color: "#14100c" },
  ],
};

// Before paint: mark JS available (entrance targets may wait for their cue) and restore the theme.
const boot = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('ved-theme');if(t==='light'||t==='dark')d.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${archivo.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to the shop floor
        </a>
        <SmoothScroll />
        <ShopHeader />
        {children}
        <ClosingTime />
        <CatalogTerminal />
        <CursorLabel />
        <Notices />
      </body>
    </html>
  );
}
