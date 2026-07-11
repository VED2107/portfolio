const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const USERNAME = "VED2107";

const QUERY = `
query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    following { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      nodes {
        name
        stargazerCount
        primaryLanguage { name color }
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          stargazerCount
          forkCount
          primaryLanguage { name color }
          url
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            contributionLevel
          }
        }
      }
    }
  }
}`;

export interface GitHubData {
  stats: {
    followers: number;
    following: number;
    publicRepos: number;
    totalStars: number;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalContributions: number;
  };
  pinnedRepos: {
    name: string;
    description: string | null;
    stars: number;
    forks: number;
    language: { name: string; color: string } | null;
    url: string;
  }[];
  topRepos: {
    name: string;
    stars: number;
    language: { name: string; color: string } | null;
  }[];
  languages: { name: string; color: string; count: number; percentage: number }[];
  contributions: {
    date: string;
    count: number;
    level: number;
  }[];
  fetchedAt: string;
}

const LEVEL_MAP: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export async function fetchGitHubData(): Promise<GitHubData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not set — Mission Control will use fallback data");
    return null;
  }

  // Bound the request so a slow/hanging GitHub API can't stall the server render
  // (this fetch is awaited in the RSC render path and during ISR revalidation).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(GITHUB_GRAPHQL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
      next: { revalidate: 3600 },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`GitHub API returned ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.error("GitHub GraphQL errors:", json.errors);
      return null;
    }

    const user = json.data.user;
    const repos = user.repositories.nodes || [];
    const pinned = user.pinnedItems.nodes || [];
    const contrib = user.contributionsCollection;
    const calendar = contrib.contributionCalendar;

    const totalStars = repos.reduce((s: number, r: { stargazerCount: number }) => s + r.stargazerCount, 0);

    const langMap = new Map<string, { color: string; count: number }>();
    for (const repo of repos) {
      if (repo.primaryLanguage) {
        const existing = langMap.get(repo.primaryLanguage.name);
        if (existing) {
          existing.count++;
        } else {
          langMap.set(repo.primaryLanguage.name, { color: repo.primaryLanguage.color || "#A0A0A0", count: 1 });
        }
      }
    }
    const totalLangRepos = Array.from(langMap.values()).reduce((s, l) => s + l.count, 0);
    const languages = Array.from(langMap.entries())
      .map(([name, { color, count }]) => ({
        name,
        color,
        count,
        percentage: Math.round((count / totalLangRepos) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const contributions = calendar.weeks
      .flatMap((w: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVEL_MAP[d.contributionLevel] ?? 0,
        }))
      );

    return {
      stats: {
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        publicRepos: user.repositories.totalCount,
        totalStars,
        totalCommits: contrib.totalCommitContributions,
        totalPRs: contrib.totalPullRequestContributions,
        totalIssues: contrib.totalIssueContributions,
        totalContributions: calendar.totalContributions,
      },
      pinnedRepos: pinned.map((r: { name: string; description: string | null; stargazerCount: number; forkCount: number; primaryLanguage: { name: string; color: string } | null; url: string }) => ({
        name: r.name,
        description: r.description,
        stars: r.stargazerCount,
        forks: r.forkCount,
        language: r.primaryLanguage,
        url: r.url,
      })),
      topRepos: repos.slice(0, 5).map((r: { name: string; stargazerCount: number; primaryLanguage: { name: string; color: string } | null }) => ({
        name: r.name,
        stars: r.stargazerCount,
        language: r.primaryLanguage,
      })),
      languages,
      contributions,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      console.error("GitHub fetch aborted — exceeded 10s timeout");
    } else {
      console.error("GitHub fetch failed:", e);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
