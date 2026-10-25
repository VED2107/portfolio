"use client";

import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

/**
 * The neon in the footer window: Ahmedabad's local time, and whether I'm likely awake to answer.
 * Rendered after mount so the server's clock never disagrees with the visitor's.
 */
// A clock as an external store: ticks every 30 s, reads as "unknown" on the server.
const STEP = 30_000;
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, STEP);
  return () => clearInterval(id);
};
const tick = () => Math.floor(Date.now() / STEP);
const noTick = () => -1;

export function ShopHours() {
  const t = useSyncExternalStore(subscribe, tick, noTick);
  const now = t < 0 ? null : new Date(t * STEP);

  const time = now ? fmt.format(now) : "--:--";
  const hour = now ? Number(time.slice(0, 2)) : 12;
  const open = hour >= 9 && hour < 24;

  return (
    <p className="hours" data-open={open || undefined}>
      <span className="hours-neon">{open ? "Open" : "Closed"}</span>
      <span className="hours-text">
        {time} in Ahmedabad. {open ? "Replies usually the same day." : "Back at 9 in the morning, IST."}
      </span>
    </p>
  );
}
