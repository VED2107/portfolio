"use client";
import Image from "next/image";
import { useRef } from "react";
import type { Callout, Img } from "@/lib/work";
import { CloseIcon } from "./icons";

/**
 * A screenshot that opens full size in a native modal dialog: Escape closes, focus stays inside
 * while open and returns to the image after, and tapping outside the picture closes on touch.
 */
export function Zoom({ img, caption, callouts }: { img: Img; caption: string; callouts?: Callout[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const close = () => dlg.current?.close();
  return (
    <figure className="wide-figure" style={{ marginInline: 0 }}>
      <button ref={btn} type="button" className="zoom" onClick={() => dlg.current?.showModal()} aria-label={`Enlarge: ${img.alt}`}>
        <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="(max-width: 1100px) 100vw, 1100px" quality={90} />
        {callouts?.map((c, i) => (
          <span key={c.n} className="pin" style={{ left: `${c.x}%`, top: `${c.y}%` }} aria-hidden>
            {i + 1}
          </span>
        ))}
        <span className="zoom-hint" aria-hidden>
          Enlarge
        </span>
      </button>
      <figcaption>
        {caption}
        {callouts && callouts.length > 0 && (
          <ol className="callout-list">
            {callouts.map((c, i) => (
              <li key={c.n}>
                <span className="callout-n" aria-hidden>
                  {i + 1}
                </span>
                <span>{c.label}</span>
              </li>
            ))}
          </ol>
        )}
      </figcaption>
      <dialog
        ref={dlg}
        className="sheet lightbox"
        aria-label={img.alt}
        onClose={() => btn.current?.focus()}
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "FIGURE") close();
        }}
      >
        <button type="button" className="icon-btn sheet-close" onClick={close} aria-label="Close" autoFocus>
          <CloseIcon />
        </button>
        <figure style={{ margin: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size original, loaded only when opened */}
          <img src={img.src} alt={img.alt} loading="lazy" />
          <figcaption>{caption}</figcaption>
        </figure>
      </dialog>
    </figure>
  );
}
