import type { NextConfig } from "next";

// Security + performance response headers applied to every route.
// Verified against node_modules/next/dist/docs — headers() is the Next 16 async config API.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Pin the workspace root: a parent folder has its own lockfile, which confuses inference.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    qualities: [75, 90],
  },
  // Route navigations run as React transitions, so <ViewTransition> can soften page changes.
  // Browsers without the API just navigate.
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
      { source: "/resume", destination: "/Ved_Chauhan_RESUME.pdf", permanent: false },
      { source: "/cv", destination: "/Ved_Chauhan_RESUME.pdf", permanent: false },
      // The old Quick View was the readable version of the record shop; the homepage is that now.
      { source: "/quick", destination: "/", permanent: true },
      { source: "/work", destination: "/#work", permanent: false },
      { source: "/profile", destination: "/about", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
