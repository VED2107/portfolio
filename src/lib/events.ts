"use client";

/** A tiny event bus: components talk through window events instead of shared global state. */

export function openPalette(query = "") {
  window.dispatchEvent(new CustomEvent("ved:palette", { detail: { query } }));
}

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("ved:toast", { detail: { message } }));
}

export type Theme = "light" | "dark" | "system";

export function setTheme(theme: Theme) {
  const d = document.documentElement;
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
  }
  window.dispatchEvent(new CustomEvent("ved:theme"));
}

export function currentTheme(): "light" | "dark" {
  const d = document.documentElement.dataset.theme;
  if (d === "light" || d === "dark") return d;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function toggleTheme() {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
