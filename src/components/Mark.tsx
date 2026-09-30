/** The VED.EXE mark: V, full stop. The V takes the ink colour, the square takes the accent, so it follows every theme. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 218 182" className={className} aria-hidden focusable="false">
      <path d="M0 0 L56 0 L96.73 152 L137.46 0 L193.46 0 L144.69 182 L48.77 182 Z" fill="currentColor" />
      <rect x="171.02" y="136" width="46" height="46" fill="var(--accent)" />
    </svg>
  );
}
