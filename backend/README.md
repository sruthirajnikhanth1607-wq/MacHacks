# RecruiterAI Backend

FastAPI backend for resume parsing, GitHub intake, and Gemini analysis.

Current status:
- Phase 3 complete: `/analyze` multipart intake + PDF parsing + GitHub top-repo fetch
- Phase 4 complete: Gemini prompt + strict frontend JSON schema

## Local Run

```bash
pip install -r requirements.txt
set GEMINI_API_KEY=your_key_here
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `POST /analyze`
  - form-data fields: `file` (PDF), `job_description` (string), `github_username` (string)
  - response schema:
    - `ats_score` (0-100)
    - `github_analysis` (string)
    - `missing_keywords` (string[])
    - `heatmap.strong_phrases` (string[])
    - `heatmap.weak_phrases` (string[])
