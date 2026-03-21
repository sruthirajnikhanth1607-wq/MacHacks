Product Requirements Document: RecruiterAI (Hackathon Prototype)
1. Project Overview
Name: RecruiterAI
Objective: A 6-hour hackathon prototype that simulates a recruiter reviewing a resume. It evaluates a candidate's PDF resume against a specific Job Description (JD) and their GitHub portfolio, returning an ATS score, actionable feedback, and a color-coded text "heatmap" highlighting strong and weak phrases.
Constraint: This is a local-only demo. Speed and visual impact are prioritized over scalable architecture or database persistence.

2. Technical Stack
Frontend: Next.js (App Router), React, Tailwind CSS.

Backend: Python, FastAPI (Running locally via WSL/Ubuntu).

AI/Processing: OpenAI API (gpt-4o-mini for speed), PyMuPDF (for raw text extraction).

External APIs: GitHub REST API (Public Repos).

3. Core Features & UI Layout
3.1 The Dashboard (Frontend)
A modern, single-page application with a dark/light mode toggle.

Input Panel (Left Side):

Drag-and-drop file uploader for a PDF resume.

Textarea for pasting the Job Description.

Text input for a GitHub username.

A prominent "Analyze Resume" primary button.

Results Panel (Right Side - Hidden until loaded):

ATS Score: A large, animated circular progress indicator (0-100).

GitHub Insights: A short text summary connecting repo data to the JD.

Missing Keywords: A cluster of small pill-badges showing required skills missing from the resume.

The "Heatmap" Viewer: The extracted text of the resume rendered on-screen. High-impact phrases are highlighted in green (bg-green-200 text), and weak/flagged phrases are highlighted in red (bg-red-200 text).

3.2 The "God Mode" Fallback
A hidden trigger (e.g., double-clicking the header logo) that bypasses the backend and immediately populates the UI with a hardcoded, perfect JSON response. This ensures the live presentation succeeds even if APIs fail.

4. API & Data Flow
The Next.js frontend will make a single multipart/form-data POST request to the FastAPI backend at http://localhost:8000/analyze.

Request Payload:
file: The PDF document.

job_description: String.

github_username: String.

Expected JSON Response (Strict Schema):
The backend must enforce this exact JSON structure from the LLM to ensure the frontend renders correctly without breaking.

JSON
{
  "ats_score": 85,
  "github_analysis": "Your 'Python-Data-App' repo uses Pandas, which perfectly matches the JD's requirement for data analysis skills.",
  "missing_keywords": ["Docker", "Kubernetes", "Agile"],
  "heatmap": {
    "strong_phrases": ["Increased user retention by 20%", "Led a team of 4 engineers"],
    "weak_phrases": ["Responsible for fixing bugs", "Helped with deployment"]
  }
}
5. Implementation Phases for Cursor
Phase 1: Scaffolding & UI Shell

Initialize Next.js with Tailwind.

Build the split-pane layout (Input Panel on the left, empty Results Panel on the right).

Implement the drag-and-drop zone, text inputs, and a loading spinner state.

Phase 2: The "Fake" Heatmap Logic

Create a React component that takes a large string of raw text (the resume) and two arrays of substrings (strong_phrases and weak_phrases).

Write a utility function to find those substrings in the main text and wrap them in styled <span> tags (green for strong, red for weak) so the text appears color-coded.

Phase 3: Python Backend Intake

Initialize the FastAPI server.

Create the /analyze endpoint to accept the form data.

Write a helper function using PyMuPDF to extract plain text from the uploaded PDF.

Write a helper function to fetch the top 3 public repos from https://api.github.com/users/{username}/repos.

Phase 4: OpenAI Integration

Construct the prompt combining the parsed resume text, JD, and GitHub JSON.

Call the OpenAI API, enforcing the strict JSON schema defined in Section 4 using response_format: { "type": "json_object" }.

Return the JSON to the Next.js frontend.

Phase 5: Wiring & The Safety Net

Connect the frontend fetch call to the FastAPI endpoint.

Implement the "God Mode" hidden button on the frontend that instantly loads a mock JSON response to bypass the backend if needed during the live demo.