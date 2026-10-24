#!/usr/bin/env node
/**
 * Snapshot of public GitHub data for the film room: repositories (VED2107 and snowbros-labs)
 * and the bytes of each language GitHub counts in them. Writes src/lib/github-snapshot.json.
 * Uses the `gh` CLI if it is signed in, the public API otherwise.
 *
 *   node scripts/github-snapshot.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OWNERS = [
  { kind: "users", name: "VED2107" },
  { kind: "orgs", name: "snowbros-labs" },
];
const SKIP = new Set(["daily-log", "VED2107", "VED2107.github.io", ".github", "DoodleME"]);

async function api(path) {
  try {
    return JSON.parse(execFileSync("gh", ["api", path], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    const r = await fetch(`https://api.github.com/${path}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.json();
  }
}

const repos = [];
for (const o of OWNERS) {
  const list = await api(`${o.kind}/${o.name}/repos?per_page=100&sort=updated`);
  for (const r of list) {
    if (r.fork || r.private || SKIP.has(r.name)) continue;
    const languages = await api(`repos/${r.full_name}/languages`);
    repos.push({
      repo: r.full_name,
      name: r.name,
      description: r.description ?? "",
      homepage: r.homepage || "",
      language: r.language ?? "",
      stars: r.stargazers_count,
      pushed: (r.pushed_at ?? "").slice(0, 10),
      languages,
    });
  }
}

const out = { taken: new Date().toISOString().slice(0, 10), repos };
const file = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "github-snapshot.json");
writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${repos.length} repositories to ${file}`);
