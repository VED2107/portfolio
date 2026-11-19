import { describe, expect, it } from "vitest";
import { EXPERIMENTS, FILINGS, PAIRED, PRINCIPLES, READING_ORDER, SELECTED, STORIES, getFiling, slugify } from "./content";

describe("content", () => {
  it("tells a story for every project, and only for real projects", () => {
    expect(Object.keys(STORIES).sort()).toEqual(FILINGS.map((f) => f.slug).sort());
  });

  it("reads every project exactly once in the case-study order", () => {
    expect([...READING_ORDER].sort()).toEqual(FILINGS.map((f) => f.slug).sort());
    for (const s of [...SELECTED, ...PAIRED]) expect(READING_ORDER).toContain(s);
  });

  it("points each working principle at a decision that exists", () => {
    for (const p of PRINCIPLES) {
      const [path, hash] = p.href.split("#");
      const f = getFiling(path.replace("/work/", ""));
      expect(f, p.href).toBeDefined();
      expect(f!.decisions.map((d) => slugify(d.title)), p.href).toContain(hash);
    }
  });

  it("links internal experiments to real case studies", () => {
    for (const e of EXPERIMENTS.filter((x) => x.internal)) expect(getFiling(e.href!.replace("/work/", "")), e.id).toBeDefined();
  });

  it("states every project's limits and the source of its numbers", () => {
    for (const s of Object.values(STORIES)) {
      expect(s.limits.length, s.slug).toBeGreaterThan(0);
      expect(s.source.length, s.slug).toBeGreaterThan(10);
    }
  });

  it("never presents the AMR research as a treatment", () => {
    const amr = getFiling("amr-drug-repurposing")!;
    const text = JSON.stringify([amr, STORIES["amr-drug-repurposing"]]).toLowerCase();
    // The only mentions allowed are the explicit negations.
    const allowed = ["results called a cure", "no prediction is presented as evidence that a medicine treats", "nothing here says a medicine treats"];
    let rest = text;
    for (const a of allowed) rest = rest.split(a).join("");
    expect(rest).not.toMatch(/\bcures?\b|\btreats?\b/);
    expect(STORIES["amr-drug-repurposing"].limits.join(" ")).toMatch(/not clinical evidence/);
  });
});
