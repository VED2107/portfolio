"use client";

import { useEffect, useState } from "react";

/**
 * Stock signage tied to a real clock: the shop is "open" when it's working hours in
 * Ahmedabad (IST), which is when an email gets a same-day answer. Rendered after mount so the
 * server's clock never disagrees with yours.
 */
export function useShopHours() {
  const [state, setState] = useState({ open: true, label: "Open" });
  useEffect(() => {
    const read = () => {
      const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
      const open = h >= 9 && h < 23;
      setState({ open, label: open ? "Open · replies today" : "Closed · browse anyway" });
    };
    read();
    const id = window.setInterval(read, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}
