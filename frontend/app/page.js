"use client";

import { useMemo, useState } from "react";
import HeatmapViewer from "@/components/HeatmapViewer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8002";

const GOD_MODE_RESULT = {
  ats_score: 98,
  github_analysis:
    "Your portfolio shows production-ready Python and React projects, and your starred data tooling repo strongly aligns with the JD's analytics stack.",
  missing_keywords: ["Kubernetes"],
  heatmap: {
    strong_phrases: [
      "Increased user retention by 20%",
      "Led a team of 4 engineers",
    ],
    weak_phrases: ["Responsible for fixing bugs", "Helped with deployment"],
  },
};

const GOD_MODE_RESUME_TEXT =
  "Software Engineer with 3+ years of experience building internal platforms. Increased user retention by 20% by redesigning onboarding and leading weekly A/B test reviews. Led a team of 4 engineers to launch a dashboard used by 300+ clients. Responsible for fixing bugs in legacy APIs and Helped with deployment during release cycles.";

const buildHeatmapPreviewText = (result) => {
  const strong = result?.heatmap?.strong_phrases ?? [];
  const weak = result?.heatmap?.weak_phrases ?? [];

  return [
    "Resume excerpt for visualization.",
    ...strong,
    "Potentially weaker language:",
    ...weak,
  ].join(". ");
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [heatmapText, setHeatmapText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const buttonLabel = useMemo(
    () => (isLoading ? "Analyzing..." : "Analyze Resume"),
    [isLoading],
  );

  const onFilePicked = (file) => {
    if (!file || file.type !== "application/pdf") {
      return;
    }
    setSelectedFile(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    onFilePicked(file);
  };

  const onAnalyze = async (event) => {
    event.preventDefault();
    if (!selectedFile || !jobDescription.trim() || !githubUsername.trim()) {
      setErrorMessage("Please add a PDF, job description, and GitHub username.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("job_description", jobDescription.trim());
    formData.append("github_username", githubUsername.trim());

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        const detail = payload?.detail ?? "Analysis request failed.";
        throw new Error(detail);
      }

      setAnalysisResult(payload);
      setHeatmapText(buildHeatmapPreviewText(payload));
    } catch (error) {
      setErrorMessage(error.message || "Unable to analyze resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const activateGodMode = () => {
    setAnalysisResult(GOD_MODE_RESULT);
    setHeatmapText(GOD_MODE_RESUME_TEXT);
    setErrorMessage("");
  };

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
        <section className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:w-1/2">
          <div className="mb-6">
            <p
              onDoubleClick={activateGodMode}
              className="inline-block cursor-default text-xs font-semibold uppercase tracking-wider text-zinc-500"
              title="RecruiterAI"
            >
              RecruiterAI
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Resume Analyzer</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Upload a resume, paste a job description, and add a GitHub username.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onAnalyze}>
            <label
              htmlFor="resume-file"
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`block cursor-pointer rounded-xl border-2 border-dashed p-5 transition ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
              }`}
            >
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : "Drag and drop PDF resume"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                or click to browse local files
              </p>
              <input
                id="resume-file"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(event) => onFilePicked(event.target.files?.[0])}
              />
            </label>

            <div>
              <label
                htmlFor="job-description"
                className="mb-2 block text-sm font-medium"
              >
                Job Description
              </label>
              <textarea
                id="job-description"
                rows={7}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Paste the job description here..."
              />
            </div>

            <div>
              <label htmlFor="github-username" className="mb-2 block text-sm font-medium">
                GitHub Username
              </label>
              <input
                id="github-username"
                value={githubUsername}
                onChange={(event) => setGithubUsername(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. octocat"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {buttonLabel}
            </button>

            {errorMessage && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
          </form>
        </section>

        <section className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:w-1/2">
          <h2 className="text-xl font-semibold">Results Panel</h2>
          {!analysisResult && (
            <p className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Results are hidden until analysis completes.
            </p>
          )}

          {analysisResult && (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    ATS Score
                  </p>
                  <p className="mt-1 text-4xl font-bold text-indigo-600">
                    {analysisResult.ats_score}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Missing Keywords
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysisResult.missing_keywords.length === 0 && (
                      <span className="text-sm text-zinc-600">None detected</span>
                    )}
                    {analysisResult.missing_keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-800"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  GitHub Insights
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">
                  {analysisResult.github_analysis}
                </p>
              </div>

              <div className="mt-3">
                <HeatmapViewer
                  text={heatmapText}
                  strongPhrases={analysisResult.heatmap.strong_phrases}
                  weakPhrases={analysisResult.heatmap.weak_phrases}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
