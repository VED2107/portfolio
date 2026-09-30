import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const ICONS = { right: ArrowRight, down: ArrowDown, left: ArrowLeft, out: ArrowUpRight } as const;

type Props = {
  href: string;
  children: React.ReactNode;
  dir?: keyof typeof ICONS;
  variant?: "solid" | "ghost";
  external?: boolean;
  transitionTypes?: string[];
  className?: string;
};

/**
 * The drafting button: a label and an arrow cell. On hover cobalt ink floods in,
 * the arrow is replaced by the next one, and crop marks register the corners.
 */
export function Action({ href, children, dir = "right", variant = "solid", external, transitionTypes, className = "" }: Props) {
  const Icon = ICONS[dir];
  const inner = (
    <>
      <span className="btn-label">
        {/* Two impressions of the label: on hover the second rolls up in fresh ink. */}
        <span className="btn-roll">
          <span>{children}</span>
          <span aria-hidden>{children}</span>
        </span>
      </span>
      <span className="btn-cell" aria-hidden>
        <Icon size={16} weight="bold" className="btn-arrow" />
        <Icon size={16} weight="bold" className="btn-arrow btn-arrow-next" />
      </span>
    </>
  );
  const cls = `btn ${variant === "ghost" ? "btn-ghost" : ""} ${className}`;
  const isInternal = href.startsWith("/") && !external && !href.endsWith(".pdf");
  if (isInternal) {
    return (
      <Link href={href} className={cls} data-dir={dir} transitionTypes={transitionTypes}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} data-dir={dir} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {inner}
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  );
}
