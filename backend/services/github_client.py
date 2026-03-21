import requests

from models import GitHubRepo


GITHUB_API_BASE = "https://api.github.com"


def fetch_top_public_repos(username: str, limit: int = 3) -> list[GitHubRepo]:
    """
    Fetch top public repos for a GitHub user.
    For hackathon speed, we rank by stargazers_count and return up to `limit`.
    """
    response = requests.get(
        f"{GITHUB_API_BASE}/users/{username}/repos",
        params={"per_page": 100, "sort": "updated"},
        timeout=15,
        headers={"Accept": "application/vnd.github+json"},
    )

    if response.status_code == 404:
        return []

    response.raise_for_status()
    repos = response.json()

    ranked = sorted(
        repos,
        key=lambda repo: repo.get("stargazers_count", 0),
        reverse=True,
    )

    top = ranked[:limit]
    return [
        GitHubRepo(
            name=repo.get("name", ""),
            url=repo.get("html_url", ""),
            stars=repo.get("stargazers_count", 0),
            language=repo.get("language"),
            description=repo.get("description"),
        )
        for repo in top
    ]
