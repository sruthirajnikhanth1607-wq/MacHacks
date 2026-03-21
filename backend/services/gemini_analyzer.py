import json
import os

from google import genai

from models import AnalyzeResponse, GitHubRepo


def _build_prompt(
    resume_text: str,
    job_description: str,
    github_username: str,
    github_repos: list[GitHubRepo],
) -> str:
    repos_payload = [
        {
            "name": repo.name,
            "url": repo.url,
            "stars": repo.stars,
            "language": repo.language,
            "description": repo.description,
        }
        for repo in github_repos
    ]

    return f"""
You are an ATS + technical recruiter assistant.
Evaluate this candidate using:
1) Resume text
2) Job description
3) GitHub portfolio metadata

Return ONLY valid JSON and follow this exact schema:
{{
  "ats_score": 85,
  "github_analysis": "Your GitHub summary text here.",
  "missing_keywords": ["Docker", "Kubernetes", "Agile"],
  "heatmap": {{
    "strong_phrases": ["Increased user retention by 20%", "Led a team of 4 engineers"],
    "weak_phrases": ["Responsible for fixing bugs", "Helped with deployment"]
  }}
}}

Rules:
- `ats_score` is an integer between 0 and 100.
- `missing_keywords` should be concise and relevant to JD gaps.
- `strong_phrases` and `weak_phrases` MUST be exact substrings from resume text.
- If data is limited, still return best-effort values with empty arrays where needed.
- Do not include markdown or extra keys.

Job Description:
{job_description}

GitHub Username:
{github_username}

GitHub Repos (JSON):
{json.dumps(repos_payload, ensure_ascii=True)}

Resume Text:
{resume_text}
""".strip()


def analyze_with_gemini(
    resume_text: str,
    job_description: str,
    github_username: str,
    github_repos: list[GitHubRepo],
) -> AnalyzeResponse:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY is not set.")

    client = genai.Client(api_key=api_key)

    prompt = _build_prompt(
        resume_text=resume_text,
        job_description=job_description,
        github_username=github_username,
        github_repos=github_repos,
    )

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "temperature": 0.2,
            "response_mime_type": "application/json",
        },
    )

    content = response.text if response else None
    if not content:
        raise RuntimeError("Gemini returned an empty response.")

    parsed = json.loads(content)
    return AnalyzeResponse.model_validate(parsed)
