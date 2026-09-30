import Image from "next/image";
import type { Figure } from "@/lib/work";
import { CalloutImage } from "./CalloutImage";
import { Drawing } from "./Drawings";

export function CodeBlock({ title, code }: { title?: string; code: string }) {
  return (
    <div className="fig overflow-hidden bg-[var(--ink)] text-[var(--paper)]" style={{ borderColor: "var(--ink)" }}>
      {title && (
        <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--paper)_18%,transparent)] px-4 py-2">
          <span className="t-num opacity-70">{title}</span>
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-[1.7] [tab-size:2]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Renders one figure of a filing, with its FIG. number and caption. */
export function FigureView({ figure, n, priority = false }: { figure: Figure; n: number; priority?: boolean }) {
  return (
    <figure className="min-w-0">
      {figure.kind === "image" &&
        (figure.callouts?.length ? (
          <CalloutImage img={figure.img} callouts={figure.callouts} priority={priority} />
        ) : (
          <div className="fig">
            <Image src={figure.img.src} alt={figure.img.alt} width={figure.img.w} height={figure.img.h} sizes="(min-width: 1024px) 60vw, 100vw" priority={priority} />
          </div>
        ))}
      {figure.kind === "code" && <CodeBlock title={figure.title} code={figure.code} />}
      {figure.kind === "drawing" && (
        <div className="fig bg-[var(--paper-3)] p-4 sm:p-8">
          <Drawing drawing={figure.drawing} />
        </div>
      )}
      <figcaption className="fig-caption">
        <b>FIG. {n}</b>
        <span>{figure.caption}</span>
      </figcaption>
    </figure>
  );
}
