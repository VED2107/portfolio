import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransition } from "react";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/site";

// One neutral sans for everything you read, self-hosted at build time; a mono for small labels.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap", weight: ["400", "500", "600"] });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", weight: ["400", "500"] });

const description =
  "Ved S. Chauhan, software engineer and founder of SNOWBROS in Gujarat, India. Research pipelines, native media software, static analysis and the applications real businesses run on, with the thinking left in.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Ved Chauhan · Software engineer", template: "%s · Ved Chauhan" },
  description,
  alternates: { canonical: "/" },
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
  themeColor: "#fcfcfa",
};

// Runs before first paint: restores a chosen theme (no flash) and marks that scripts are on, which
// is the only condition under which reveal animations may hide anything.
const boot = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")d.setAttribute("data-theme",t)}catch(e){}var dark=d.getAttribute("data-theme")==="dark"||(!d.getAttribute("data-theme")&&matchMedia("(prefers-color-scheme: dark)").matches);var m=document.querySelector('meta[name="theme-color"]');if(m&&dark)m.setAttribute("content","#171816")})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Header />
        <ViewTransition default="page">
          <div>
            {children}
            <Footer />
          </div>
        </ViewTransition>
        <div className="edge" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <Reveal />
      </body>
    </html>
  );
}
