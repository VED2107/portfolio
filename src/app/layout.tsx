import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Schibsted_Grotesk, Shrikhand } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { ALSO, FEATURED, getFiling } from "@/lib/work";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CommandPalette, type PaletteItem } from "@/components/CommandPalette";
import { Ambience } from "@/components/Ambience";
import { Reveal } from "@/components/Reveal";
import { Toast } from "@/components/Toast";
import { NowPlaying } from "@/components/NowPlaying";

// The record-label voice: one variable family whose width axis runs from a tight condensed
// headline (the 60s jazz sleeve) to the wide small print on a centre label.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

// The shop sign: a heavy 70s groove script, for the name over the door and nowhere it has to be read fast.
const shrikhand = Shrikhand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sign",
  display: "swap",
});

// The printed word: everything you read.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-print",
  display: "swap",
});

// Only inside real code blocks.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-stamp",
  display: "swap",
});

const description =
  "Ved S. Chauhan, software engineer and founder of SNOWBROS. A boutique's point of sale, a multi-currency ledger, a Rust static analyzer, a drug-repurposing research platform, and more, all shipped and running.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Ved Chauhan · Software engineer",
    template: "%s · Ved Chauhan",
  },
  description,
  authors: [{ name: SITE.person, url: SITE.url }],
  creator: SITE.person,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ved Chauhan",
    title: "Ved Chauhan · Software engineer",
    description,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Ved Chauhan, software engineer" }],
  },
  twitter: { card: "summary_large_image", title: "Ved Chauhan · Software engineer", description, images: ["/api/og"] },
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
    { media: "(prefers-color-scheme: light)", color: "#1d1712" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1712" },
  ],
};

// Before paint: mark JS available (entrances may wait for their cue) and restore the theme.
const boot = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('ved-theme');if(t==='light'||t==='dark')d.dataset.theme=t;}catch(e){}})();`;

const PROJECTS = [...FEATURED.map((f) => f.slug), ...ALSO, "ved-exe"].map((s) => getFiling(s)!).filter(Boolean);

const PALETTE: PaletteItem[] = [
  { group: "Sections", label: "Selected work", href: "/#work" },
  { group: "Sections", label: "About", href: "/#about" },
  { group: "Sections", label: "Recognition", href: "/#recognition", keywords: "awards research conclave appreciation certificates" },
  { group: "Sections", label: "Stack and GitHub activity", href: "/#stack", keywords: "skills tools languages commits" },
  { group: "Sections", label: "Contact", href: "/#contact", keywords: "hire email freelance" },
  ...PROJECTS.map<PaletteItem>((f) => ({ group: "Projects", label: f.title, hint: f.field, href: `/work/${f.slug}`, keywords: f.stack.join(" ") })),
  { group: "Links", label: "Résumé (PDF)", href: SITE.resume, keywords: "cv resume" },
  { group: "Links", label: "GitHub", hint: SITE.githubHandle, href: SITE.github },
  { group: "Links", label: "LinkedIn", href: SITE.linkedin },
  { group: "Links", label: "SNOWBROS studio", hint: "snowbros.me", href: SITE.studioUrl },
  { group: "Links", label: "Copy email address", hint: SITE.email, action: "copy-email" },
  { group: "Settings", label: "Light theme", action: "theme-light" },
  { group: "Settings", label: "Dark theme", action: "theme-dark" },
  { group: "Settings", label: "Match system theme", action: "theme-system" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${shrikhand.variable} ${schibsted.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <CommandPalette items={PALETTE} email={SITE.email} />
        <NowPlaying />
        <Toast />
        <Reveal />
        <Ambience />
      </body>
    </html>
  );
}
