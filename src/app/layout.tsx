import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Fraunces, IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
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
import "./pages.css";
import { SITE } from "@/lib/site";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SmoothScroll } from "@/components/shop/SmoothScroll";
import { CursorLabel } from "@/components/shop/CursorLabel";
import { CatalogTerminal } from "@/components/shop/CatalogTerminal";
import { Notices } from "@/components/shop/Notices";
import { ClosingTime } from "@/components/shop/ClosingTime";

// Signwriting: condensed shop-fascia letters for names, aisles and the marquee.
const shoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-sign",
  display: "swap",
});

// The label: a soft, heavy 70s serif, the kind printed on record labels and painted on shop
// windows. Used for the name and for release titles only.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-label",
  display: "swap",
});

// The printed word: a newspaper grotesk for everything you read.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-print",
  display: "swap",
});

// Catalogue numbers, runout etching, timestamps.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-stamp",
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
    { media: "(prefers-color-scheme: light)", color: "#171615" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b0b" },
  ],
};

// Before paint: mark JS available (entrance targets may wait for their cue) and restore the theme.
const boot = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('ved-theme');if(t==='light'||t==='dark')d.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${shoulders.variable} ${fraunces.variable} ${schibsted.variable} ${plexMono.variable}`} suppressHydrationWarning>
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
