"use client";

/** Tiny event bus: components talk through window events instead of global state. */

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
}

export function toggleBlueprint() {
  const d = document.documentElement;
  const on = d.dataset.mode !== "blueprint";
  if (on) d.dataset.mode = "blueprint";
  else delete d.dataset.mode;
  try {
    if (on) localStorage.setItem("ved-mode", "blueprint");
    else localStorage.removeItem("ved-mode");
  } catch {
    /* ignore */
  }
  toast(on ? "Blueprint mode. The filing, as a cyanotype. Run it again to develop back." : "Back to drafting white.");
}

export async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email);
    return true;
  } catch {
    return false;
  }
}
