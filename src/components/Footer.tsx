"use client";

import { SITE } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/50">
          DESIGNED & BUILT BY {SITE.title.toUpperCase()} © {new Date().getFullYear()}
        </div>
        <div className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/30">
          VED.EXE v2.1.07 — ALL SYSTEMS OPERATIONAL
        </div>
      </div>
    </footer>
  );
}
