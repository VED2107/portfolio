import { fetchGitHubData } from "@/lib/github";
import { HomePage } from "@/components/HomePage";

export const revalidate = 3600;

export default async function Page() {
  const githubData = await fetchGitHubData();
  return <HomePage githubData={githubData} />;
}
