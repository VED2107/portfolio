import Image from "next/image";
import type { Film } from "@/lib/catalog";

/** Case artwork for the film shelf: a still if the film has one, a title card if it doesn't. */
export function FilmCover({ f, sizes = "300px" }: { f: Film; sizes?: string }) {
  return (
    <div className={`film-cover film-${f.id}`} style={{ "--tone": f.tone } as React.CSSProperties}>
      {f.cover ? (
        <Image src={f.cover.src} alt="" width={f.cover.w} height={f.cover.h} sizes={sizes} className="film-still" />
      ) : (
        <span className="film-card" aria-hidden>
          <span className="pk">{f.edition}</span>
        </span>
      )}
      <span className="film-cover-title display">{f.title}</span>
      <span className="film-cover-band pk" aria-hidden>
        <span>HD · Archive</span>
        <span>{f.cat}</span>
      </span>
    </div>
  );
}
