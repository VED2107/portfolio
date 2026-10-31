import type { CSSProperties } from "react";

/**
 * The mark: a record sleeve cut with a V, the record sliding out of it.
 * Geometry matches brand/logo/ved-sleeve.svg. The record is drawn whole and centred, inside a nested
 * <svg> that clips it to the right of the sleeve, so it can roll out of (and back into) the sleeve.
 *
 * motion  "intro"  rolls the record out once on mount (default)
 *         "lost"   rolls it out and off the edge, leaving the sleeve empty (404)
 *         "none"   static
 * spinning keeps the record turning at 33⅓ rpm (loading); hovering a link that holds the mark does too.
 * The sleeve takes currentColor; the record takes --vmark-record (tangerine by default).
 */
export function VedMark({
  size = 32,
  motion = "intro",
  spinning = false,
  label,
  className,
  style,
}: {
  size?: number | string;
  motion?: "intro" | "lost" | "none";
  spinning?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className ? `vmark ${className}` : "vmark"}
      data-motion={motion}
      data-spinning={spinning || undefined}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <svg x="157" y="0" width="99" height="256" viewBox="157 0 99 256">
        <g className="vmark-slide">
          <path
            className="vmark-disc"
            fillRule="evenodd"
            d="M179 68 A60 60 0 1 1 179 188 A60 60 0 1 1 179 68 Z M179 107 A21 21 0 1 0 179 149 A21 21 0 1 0 179 107 Z M179 110 A18 18 0 1 1 179 146 A18 18 0 1 1 179 110 Z M179 123 A5 5 0 1 0 179 133 A5 5 0 1 0 179 123 Z M204.71 97.36 A40 40 0 0 1 204.71 158.64 L202.14 155.58 A36 36 0 0 0 202.14 100.42 Z"
          />
        </g>
      </svg>
      <path
        className="vmark-sleeve"
        fillRule="evenodd"
        d="M21 64 H149 V192 H21 Z M46.6 92 L70.6 92 L85 145.7 L99.4 92 L123.4 92 L103 168 L67 168 Z"
      />
    </svg>
  );
}
