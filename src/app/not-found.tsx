import Link from "next/link";
import { QuickHeader } from "@/components/QuickChrome";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <QuickHeader />
      <main id="main" className="wrap grid min-h-[70vh] content-center justify-items-center gap-6 py-16 text-center">
        <p className="cat">404</p>
        <h1 className="display text-4xl sm:text-6xl">This record isn&apos;t in the shop.</h1>
        <div className="intro-actions justify-center">
          <Link href="/" className="btn btn-accent">Walk into the store</Link>
          <Link href="/quick" className="btn">Quick View</Link>
        </div>
      </main>
    </>
  );
}
