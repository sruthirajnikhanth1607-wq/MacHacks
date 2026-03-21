type GithubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
};

type GithubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
};

function isValidGithubUsername(username: string): boolean {
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username);
}

export async function fetchGithubContext(username: string): Promise<string> {
  if (!isValidGithubUsername(username)) {
    return "";
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const userResponse = await fetch(`https://api.github.com/users/${username}`, {
    headers,
    next: { revalidate: 0 },
  });

  if (!userResponse.ok) {
    return "";
  }

  const user = (await userResponse.json()) as GithubUser;

  const reposResponse = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=12&type=owner`,
    {
      headers,
      next: { revalidate: 0 },
    }
  );

  const reposRaw = reposResponse.ok
    ? ((await reposResponse.json()) as GithubRepo[])
    : [];

  const repos = reposRaw
    .filter((r) => !r.archived)
    .slice(0, 10);

  const repoLines = repos.map((repo) => {
    const language = repo.language || "Not set";
    const description = repo.description || "No description";
    const topics =
      repo.topics && repo.topics.length > 0
        ? repo.topics.slice(0, 5).join(", ")
        : "none listed";
    const home = repo.homepage ? ` live/demo: ${repo.homepage}` : "";
    const forkNote = repo.fork ? " (fork)" : "";
    return `- **${repo.name}**${forkNote} | ${language} | ${description} | topics: ${topics} | ⭐${repo.stargazers_count} forks:${repo.forks_count} | last push: ${repo.pushed_at.slice(0, 10)}${home} | ${repo.html_url}`;
  });

  const profileBits = [
    `Profile URL: ${user.html_url}`,
    `Display name: ${user.name || "(none)"}`,
    `Bio: ${user.bio || "(empty — recruiters see this first)"}`,
    `Location: ${user.location || "(not set)"}`,
    `Company field: ${user.company || "(not set)"}`,
    `Website/blog: ${user.blog || "(none)"}`,
    user.twitter_username
      ? `Social: @${user.twitter_username} on X`
      : "Social: (no X handle on profile)",
    `Account age (public): since ${user.created_at.slice(0, 10)}`,
    `Stats: ${user.public_repos} public repos · ${user.followers} followers · ${user.following} following`,
  ];

  return [
    "=== GitHub public profile (for resume alignment) ===",
    ...profileBits,
    "",
    "=== Recently updated repositories (up to 10; use these to judge fit vs job and resume claims) ===",
    ...repoLines,
  ].join("\n");
}
