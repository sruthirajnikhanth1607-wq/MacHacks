from pydantic import BaseModel, Field


class GitHubRepo(BaseModel):
    name: str
    url: str
    stars: int
    language: str | None = None
    description: str | None = None


class Heatmap(BaseModel):
    strong_phrases: list[str]
    weak_phrases: list[str]


class AnalyzeResponse(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    github_analysis: str
    missing_keywords: list[str]
    heatmap: Heatmap
