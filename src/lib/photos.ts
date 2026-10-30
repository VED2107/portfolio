/**
 * Photos are whatever is actually in public/: award photos by honour id, and every image in
 * public/album/ for the lounge's photo album. Read at build time on the server, so a missing file
 * means no photo, never a broken image.
 */
import fs from "node:fs";
import path from "node:path";

const PUBLIC = path.join(process.cwd(), "public");
const EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

export type Photo = { src: string; alt: string };

function humanise(file: string) {
  const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/^\d+[-_ ]*/, "");
  const words = base.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Every photo for one honour: <id>.jpg, then <id>-1.jpg, <id>-2.jpg ... (any of the extensions). */
export function awardPhotos(id: string): Photo[] {
  const dir = path.join(PUBLIC, "awards");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => EXT.includes(path.extname(f).toLowerCase()) && (f.replace(/\.[a-z0-9]+$/i, "") === id || f.startsWith(`${id}-`)))
    .sort()
    .map((f) => ({ src: `/awards/${f}`, alt: humanise(id) }));
}

export function awardPhoto(id: string): Photo | null {
  return awardPhotos(id)[0] ?? null;
}

/** Album photos, in filename order: prefix files with 01-, 02- to set the order. The rest of the name becomes the caption. */
export function album(): Photo[] {
  const dir = path.join(PUBLIC, "album");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => EXT.includes(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => ({ src: `/album/${f}`, alt: humanise(f) }));
}
