"use client";

/**
 * The basket: every release you pulled out to look at this visit, in order. The checkout
 * receipt prints it, and the special-order email can mention it. Session only.
 */
import { useSyncExternalStore } from "react";

const KEY = "ved-basket";
let items: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    items = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    items = [];
  }
}

export function addToBasket(slug: string) {
  load();
  if (items.includes(slug)) return;
  items = [...items, slug];
  try {
    sessionStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  for (const l of listeners) l();
}

const EMPTY: string[] = [];
export function useBasket(): string[] {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return items;
    },
    () => EMPTY,
  );
}
