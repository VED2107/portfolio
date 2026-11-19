/** A handful of 24px line icons, drawn here so no icon library ships for six glyphs. */
type P = { className?: string };
const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const CopyIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.2" />
    <path d="M15.5 8.5V6.7A2.2 2.2 0 0 0 13.3 4.5H6.7A2.2 2.2 0 0 0 4.5 6.7v6.6a2.2 2.2 0 0 0 2.2 2.2h1.8" />
  </svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const SunIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);
export const MoonIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z" fill="currentColor" stroke="none" />
  </svg>
);
export const ArrowLeft = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const ArrowRight = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const PauseIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M9 6v12M15 6v12" strokeWidth={2} />
  </svg>
);
export const PlayIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/**
 * The personal mark: a six-armed snowflake for SNOWBROS, drawn as one hand-weighted stroke.
 * Original to this site; it pops out from behind the photo stack and closes the footer.
 */
export const Flake = ({ className }: P) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    {[0, 60, 120].map((r) => (
      <g key={r} transform={`rotate(${r} 32 32)`}>
        <path d="M32 6v52" />
        <path d="M24.5 11.5 32 18l7.5-6.5M24.5 52.5 32 46l7.5 6.5" />
      </g>
    ))}
    <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Ved's mark, "Open seal": a ring left open by exactly 60° (the C of Chauhan), a V drawn with
 * the ring's own 22-unit stroke on a 70° arm, and one point in the opening, the work going out.
 * Source and variants: brand/ved-2026 (final.py). Ink follows currentColor, the point the accent.
 */
export const Mark = ({ className, title }: P & { title?: string }) => (
  <svg viewBox="0 0 256 256" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
    <path fill="currentColor" d="M218.07 76 A104 104 0 1 0 218.07 180 L199.01 169 A82 82 0 1 1 199.01 87 Z" />
    <path fill="currentColor" d="M81.33 79 L104.74 79 L128 142.9 L151.26 79 L174.67 79 L139 177 L117 177 Z" />
    <circle fill="var(--accent)" cx="221" cy="128" r="12" />
  </svg>
);
