from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

from models import AnalyzeResponse
from services.gemini_analyzer import analyze_with_gemini
from services.github_client import fetch_top_public_repos
from services.pdf_parser import extract_text_from_pdf

backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env", override=True)
load_dotenv(backend_dir / ".env.local", override=True)
load_dotenv(backend_dir.parent / ".env", override=True)

app = FastAPI(title="RecruiterAI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    github_username: str = Form(...),
) -> AnalyzeResponse:
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Failed to parse PDF.") from exc

    try:
        github_repos = fetch_top_public_repos(github_username.strip())
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Failed to fetch GitHub repos.") from exc

    try:
        return analyze_with_gemini(
            resume_text=resume_text,
            job_description=job_description,
            github_username=github_username.strip(),
            github_repos=github_repos,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini analysis failed: {exc}",
        ) from exc
