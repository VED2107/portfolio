"use client";

/** A tiny event bus: components talk through window events instead of shared global state. */

export function openPalette(query = "") {
  window.dispatchEvent(new CustomEvent("ved:palette", { detail: { query } }));
}

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("ved:toast", { detail: { message } }));
}

export type Theme = "light" | "dark" | "system";

/** Where a theme switch was thrown from, in viewport pixels. The new lights spread out from here. */
export type Origin = { x: number; y: number };

type WithTransitions = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

export function setTheme(theme: Theme, origin?: Origin) {
  const d = document.documentElement;
  const apply = () => {
    try {
      if (theme === "system") {
        delete d.dataset.theme;
        localStorage.removeItem("ved-theme");
      } else {
        d.dataset.theme = theme;
        localStorage.setItem("ved-theme", theme);
      }
    } catch {
      /* storage can be unavailable; the attribute still applies for this visit */
      if (theme !== "system") d.dataset.theme = theme;
    }
    window.dispatchEvent(new CustomEvent("ved:theme"));
  };

  // A light switch, not a fade: the new theme opens as a circle from the switch that was pulled.
  const doc = document as WithTransitions;
  if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  d.style.setProperty("--vt-x", `${origin?.x ?? innerWidth - 48}px`);
  d.style.setProperty("--vt-y", `${origin?.y ?? 40}px`);
  d.dataset.vt = "theme";
  doc
    .startViewTransition(apply)
    .finished.catch(() => {})
    .finally(() => delete d.dataset.vt);
}

export function currentTheme(): "light" | "dark" {
  const d = document.documentElement.dataset.theme;
  if (d === "light" || d === "dark") return d;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function toggleTheme(origin?: Origin) {
  setTheme(currentTheme() === "dark" ? "light" : "dark", origin);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
