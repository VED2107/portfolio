import { ViewTransition, type ReactNode } from "react";
import { coverSVG } from "@/lib/covers";

/**
 * A record's sleeve art. Server-safe on purpose: Quick View and the 404 render it without pulling
 * any client JavaScript, and the store's client panels import the same module.
 */
export function Cover({ slug, label }: { slug: string; label?: string }) {
  return <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} dangerouslySetInnerHTML={{ __html: coverSVG(slug) }} style={{ display: "contents" }} />;
}

/**
 * Names the box that holds a sleeve so a navigation can carry it across pages: the sleeve in a
 * Quick View card flies into the case study's flipper and back again. Only one element per page
 * may hold a given name, so this wraps the one sleeve that represents the record on that page.
 */
export function SleeveTransition({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <ViewTransition name={`sleeve-${slug}`} share="sleeve-morph" default="none">
      {children}
    </ViewTransition>
  );
}
