import type { Metadata } from "next";
import { Press_Start_2P, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { CRTOverlay } from "@/components/CRTOverlay";
import { SmoothScroll } from "@/components/SmoothScroll";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { SoundManager, SoundToggle } from "@/components/SoundManager";
import { TimeOfDay } from "@/components/TimeOfDay";
import { PageTransitionWipe } from "@/components/PageTransitionWipe";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vedchauhan.dev"),
  title: "VED.EXE | Ved Chauhan — Full Stack Developer & Creative Technologist",
  description:
    "Enter the world of Ved Chauhan. Full Stack Developer, UI/UX Designer, and Creative Technologist building production-ready systems. IEEE Secretary @ GUNI, Visual Lead @ GDG.",
  keywords: [
    "Ved Chauhan",
    "Full Stack Developer",
    "UI/UX Designer",
    "Portfolio",
    "Creative Technologist",
    "Next.js",
    "React",
    "TypeScript",
  ],
  authors: [{ name: "Ved Chauhan" }],
  creator: "Ved Chauhan",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "VED.EXE | Ved Chauhan",
    description:
      "Full Stack Developer & Creative Technologist. Enter my world.",
    siteName: "VED.EXE",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "VED.EXE — Full Stack Developer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VED.EXE | Ved Chauhan",
    description:
      "Full Stack Developer & Creative Technologist. Enter my world.",
    images: ["/api/og"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${pixelFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-full bg-[#050816] text-white antialiased">
        <SoundManager>
          <SmoothScroll>
            <ScrollProgressBar />
            <CustomCursor />
            <CRTOverlay />
            <NoiseOverlay />
            <TimeOfDay />
            <PageTransitionWipe />
            <SoundToggle />
            {children}
          </SmoothScroll>
        </SoundManager>
      </body>
    </html>
  );
}
