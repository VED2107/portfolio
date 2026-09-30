const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const USERNAME = "VED2107";

const QUERY = `
query($login: String!) {
  user(login: $login) {
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      nodes {
        name
        url
        pushedAt
        primaryLanguage { name }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { contributionCount date }
        }
      }
    }
  }
}`;

export type Activity = {
  source: "graphql" | "rest";
  publicRepos: number;
  /** Only present with a token (GraphQL). */
  year?: {
    total: number;
    commits: number;
    pullRequests: number;
    /** One entry per week, oldest first. */
    weeks: { start: string; count: number }[];
  };
  languages: { name: string; share: number }[];
  recent: { name: string; url: string; pushedAt: string; language: string | null }[];
  fetchedAt: string;
};

type RepoNode = { name: string; url: string; pushedAt: string; primaryLanguage: { name: string } | null };

function languagesFrom(repos: { language: string | null }[]) {
  const counts = new Map<string, number>();
  for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  return [...counts.entries()]
    .map(([name, n]) => ({ name, share: n / total }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 6);
}

// Hourly heartbeat repo and profile README are not work.
const NOISE = new Set(["daily-log", "VED2107", "VED2107.github.io"]);

async function withTimeout<T>(run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  // Bound the request so a slow GitHub API can't stall the server render or ISR.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function fromGraphQL(token: string): Promise<Activity | null> {
  const res = await withTimeout((signal) =>
    fetch(GITHUB_GRAPHQL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
      next: { revalidate: 3600 },
      signal,
    }),
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (json.errors || !json.data?.user) return null;

  const user = json.data.user;
  const repos: RepoNode[] = user.repositories.nodes.filter((r: RepoNode) => !NOISE.has(r.name));
  const cal = user.contributionsCollection.contributionCalendar;
  const weeks = cal.weeks.map((w: { contributionDays: { contributionCount: number; date: string }[] }) => ({
    start: w.contributionDays[0]?.date ?? "",
    count: w.contributionDays.reduce((s, d) => s + d.contributionCount, 0),
  }));
  const recent = repos.map((r) => ({ name: r.name, url: r.url, pushedAt: r.pushedAt, language: r.primaryLanguage?.name ?? null }));

  return {
    source: "graphql",
    publicRepos: repos.length,
    year: {
      total: cal.totalContributions,
      commits: user.contributionsCollection.totalCommitContributions,
      pullRequests: user.contributionsCollection.totalPullRequestContributions,
      weeks,
    },
    languages: languagesFrom(recent),
    recent: recent.slice(0, 5),
    fetchedAt: new Date().toISOString(),
  };
}

async function fromREST(): Promise<Activity | null> {
  const res = await withTimeout((signal) =>
    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed&type=owner`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
      signal,
    }),
  );
  if (!res.ok) return null;
  const list: { name: string; html_url: string; pushed_at: string; language: string | null; fork: boolean }[] = await res.json();
  const repos = list
    .filter((r) => !r.fork && !NOISE.has(r.name))
    .map((r) => ({ name: r.name, url: r.html_url, pushedAt: r.pushed_at, language: r.language }));
  return {
    source: "rest",
    publicRepos: repos.length,
    languages: languagesFrom(repos),
    recent: repos.slice(0, 5),
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchActivity(): Promise<Activity | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    return (token && (await fromGraphQL(token))) || (await fromREST());
  } catch (e) {
    console.error("GitHub activity fetch failed:", e instanceof Error ? e.message : e);
    return null;
  }
}
