import type { Release } from "@/lib/catalog";
import { ReleaseCover } from "./ReleaseCover";

/** The sleeve as an object: cover art in shrink-wrap, with the hype sticker on the plastic. */
export function Sleeve({ r, sticker = true, sizes, priority, flipId }: { r: Release; sticker?: boolean; sizes?: string; priority?: boolean; flipId?: string }) {
  const h = r.hype[0];
  return (
    <div className="sleeve" data-flip-id={flipId}>
      <ReleaseCover r={r} sizes={sizes} priority={priority} />
      <span className="shrink" aria-hidden />
      {sticker && h && (
        <span className="sticker sleeve-sticker" aria-hidden>
          <b>{h.value}</b>
          <span>{h.label}</span>
        </span>
      )}
    </div>
  );
}
