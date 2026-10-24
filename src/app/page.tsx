import { FrontWindow } from "@/components/shop/FrontWindow";
import { Crate } from "@/components/shop/Crate";
import { Inspect } from "@/components/shop/Inspect";
import { FilmRoom } from "@/components/shop/FilmRoom";
import { Counter } from "@/components/shop/Counter";
import { Checkout } from "@/components/shop/Checkout";

/**
 * The shop, front to back: the window, the record crate, through the curtains into the film
 * shelf, back out to the counter, and the till. Dense, then quiet, then hands-on, then
 * editorial, then a surprise, then quiet again.
 */
export default function Shop() {
  return (
    <main id="main">
      <FrontWindow />
      <Crate />
      <FilmRoom />
      <Counter />
      <Checkout />
      <Inspect />
    </main>
  );
}
