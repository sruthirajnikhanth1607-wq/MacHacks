"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import type { AnalyzeResult as AnalysisResult } from "@/lib/gemini";
import { DEFAULT_RECRUITER_SCAN_TIPS } from "@/lib/scanTipsFallback";

type AttentionLevel = "High" | "Medium" | "Low";

/** Attention map: High → green, Medium → yellow, Low → red */
const levelStyles: Record<AttentionLevel, string> = {
  High: "bg-emerald-500/20 text-emerald-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Low: "bg-red-500/20 text-red-400",
};

const levelEmoji: Record<AttentionLevel, string> = {
  High: "🟢",
  Medium: "🟡",
  Low: "🔴",
};

function matchScoreClass(score: number): string {
  if (score >= 70) return "text-emerald-400 drop-shadow-[0_0_24px_rgba(52,211,153,0.35)]";
  if (score >= 40) return "text-amber-400 drop-shadow-[0_0_24px_rgba(251,191,36,0.35)]";
  return "text-red-400 drop-shadow-[0_0_24px_rgba(248,113,113,0.35)]";
}

function matchTier(score: number): { label: string; className: string } {
  if (score >= 70)
    return {
      label: "Strong fit",
      className: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
    };
  if (score >= 40)
    return {
      label: "Moderate fit",
      className: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30",
    };
  return {
    label: "Needs work",
    className: "bg-red-500/15 text-red-200 ring-1 ring-red-500/30",
  };
}

/** First ~2 sentences for the at-a-glance strip */
function glanceSummary(text: string): string {
  const t = text.trim();
  if (!t) return "—";
  const parts = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  const joined = parts.slice(0, 2).join(" ");
  if (joined.length <= 320) return joined;
  const cut = t.slice(0, 260).trim();
  return cut.endsWith(".") ? cut : `${cut}…`;
}

function ChunkList({
  items,
  variant,
}: {
  items: string[];
  variant: "good" | "warn" | "tip" | "neutral";
}) {
  const bar = {
    good: "border-emerald-500/60",
    warn: "border-amber-500/60",
    tip: "border-blue-500/50",
    neutral: "border-gray-600",
  }[variant];

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={`${i}-${item.slice(0, 24)}`}
          className={`border-l-2 ${bar} rounded-r-lg bg-gray-900/40 py-2.5 pl-3 pr-2 text-sm leading-snug text-gray-100`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-sm leading-snug text-gray-100 marker:font-semibold marker:text-blue-400">
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </ol>
  );
}

function SectionLabel({
  kicker,
  title,
  hint,
}: {
  kicker?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      {kicker && (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400/90">
          {kicker}
        </p>
      )}
      <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      {hint && (
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{hint}</p>
      )}
    </div>
  );
}

export default function Home() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!resume.trim() || !job.trim()) {
      setError("Please paste both your resume and the job description.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume, job, githubUsername }),
      });

      const payload = (await response.json()) as {
        result?: AnalysisResult;
        error?: string;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error || "Unable to analyze resume right now.");
      }

      const tips = payload.result.recruiter_scan_tips?.length
        ? payload.result.recruiter_scan_tips
        : DEFAULT_RECRUITER_SCAN_TIPS;

      const safeResult: AnalysisResult = {
        ...payload.result,
        github_feedback: payload.result.github_feedback || [],
        recruiter_scan_tips: tips,
      };

      setResult(safeResult);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeFileUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setResult(null);
    setParsingResume(true);

    try {
      const text = await extractResumeText(file);
      if (!text.trim()) {
        throw new Error("Uploaded file appears to be empty.");
      }

      setResume(text.trim());
      setUploadedFileName(file.name);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to parse the resume file.";
      setError(message);
      setUploadedFileName(null);
    } finally {
      setParsingResume(false);
      event.target.value = "";
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-100 outline-none transition-all duration-200 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 md:px-6">
      <div className="opacity-0 animate-fade-in">
        <section className="rounded-2xl border border-gray-700 bg-[#111827] p-6 shadow-lg md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-300"
            >
              ← Splash
            </Link>
            <span className="text-xs uppercase tracking-widest text-gray-600">
              Analyzer
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              RecruiterAI
            </span>
          </h1>
          <p className="mt-2 text-gray-400">Optimize your resume in seconds</p>

          <form onSubmit={handleAnalyze} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="resume"
                className="mb-2 block text-sm font-semibold text-gray-100"
              >
                Resume
              </label>
              <div className="mb-3">
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.rtf"
                  onChange={handleResumeFileUpload}
                  disabled={loading || parsingResume}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-100 transition-all duration-200 hover:file:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Upload PDF, DOCX, TXT, MD, or RTF. You can still paste/edit
                  text below.
                </p>
                {uploadedFileName && (
                  <p className="mt-1 text-xs text-gray-400">
                    Loaded file: {uploadedFileName}
                  </p>
                )}
                {parsingResume && (
                  <p className="mt-1 text-xs font-medium text-gray-300">
                    Parsing resume file...
                  </p>
                )}
              </div>
              <textarea
                id="resume"
                value={resume}
                onChange={(event) => setResume(event.target.value)}
                rows={10}
                className={inputClass}
                placeholder="Paste your resume here..."
              />
            </div>

            <div>
              <label
                htmlFor="github"
                className="mb-2 block text-sm font-semibold text-gray-100"
              >
                GitHub Username (optional)
              </label>
              <input
                id="github"
                value={githubUsername}
                onChange={(event) => setGithubUsername(event.target.value)}
                className={inputClass}
                placeholder="e.g. octocat"
              />
              <p className="mt-2 text-xs text-gray-500">
                If provided, RecruiterAI will also use your public GitHub profile
                and repos for suggestions.
              </p>
            </div>

            <div>
              <label
                htmlFor="job"
                className="mb-2 block text-sm font-semibold text-gray-100"
              >
                Job Description
              </label>
              <textarea
                id="job"
                value={job}
                onChange={(event) => setJob(event.target.value)}
                rows={10}
                className={inputClass}
                placeholder="Paste the job description here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || parsingResume}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 px-6 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:w-auto"
            >
              {loading && (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden
                />
              )}
              {loading ? (
                <span className="animate-pulse">Analyzing with AI...</span>
              ) : (
                "Analyze Resume"
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </section>
      </div>

      {result && (
        <section className="animate-slide-up space-y-5 opacity-0 [animation-fill-mode:forwards] md:space-y-6">
          {/* At a glance */}
          <article className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-5 shadow-lg md:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
              At a glance
            </p>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8">
              <div className="flex shrink-0 flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-medium text-gray-500">Match score</p>
                  <p
                    className={`mt-1 text-6xl font-bold tabular-nums leading-none ${matchScoreClass(result.match_score)}`}
                  >
                    {result.match_score}
                  </p>
                </div>
                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold sm:mb-2 ${matchTier(result.match_score).className}`}
                >
                  {matchTier(result.match_score).label}
                </span>
              </div>
              <div className="min-w-0 flex-1 border-t border-gray-700/80 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <p className="text-xs font-medium text-gray-500">TL;DR</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-100">
                  {glanceSummary(result.recruiter_summary)}
                </p>
              </div>
            </div>
          </article>

          {/* Side-by-side: strengths vs gaps */}
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-4 md:p-5">
              <SectionLabel
                kicker="The good"
                title="What's working"
                hint="Why it helps for this role"
              />
              <ChunkList items={result.key_strengths} variant="good" />
            </article>
            <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-4 md:p-5">
              <SectionLabel
                kicker="To improve"
                title="Gaps to close"
                hint="Skills or signals to add"
              />
              <ChunkList items={result.missing_skills} variant="warn" />
            </article>
          </div>

          {/* Improved bullets — numbered for fast scan */}
          <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-4 md:p-5">
            <SectionLabel
              kicker="Copy-paste ready"
              title="Improved resume bullets"
              hint="Lead with impact — use what fits your story"
            />
            <NumberedList items={result.improved_bullets} />
          </article>

          {/* Scan tips */}
          <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-4 md:p-5">
            <SectionLabel
              kicker="Layout"
              title="Recruiter scan tips"
              hint="Where eyes go first (~7s skim) — not personal tracking"
            />
            <ChunkList items={result.recruiter_scan_tips} variant="tip" />
          </article>

          {/* GitHub */}
          <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-4 md:p-5">
            <SectionLabel
              kicker="GitHub"
              title="Profile & repo ideas"
              hint={
                githubUsername.trim()
                  ? `Based on @${githubUsername.trim()}`
                  : "Add your username above for tailored repo tips"
              }
            />
            {(result.github_feedback || []).length > 0 ? (
              <ChunkList items={result.github_feedback} variant="neutral" />
            ) : (
              <p className="mt-2 rounded-lg bg-gray-900/50 px-3 py-2 text-sm text-gray-400">
                Add your GitHub username in the form so we can line up your
                repos with this job.
              </p>
            )}
          </article>

          {/* Full summary */}
          <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-4 md:p-5">
            <SectionLabel
              kicker="Full picture"
              title="Recruiter-style summary"
            />
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-gray-100">
              {result.recruiter_summary}
            </p>
          </article>

          {/* Attention map — compact chips */}
          <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-4 md:p-5">
            <SectionLabel
              kicker="Focus areas"
              title="Attention map"
              hint="What stands out vs. what’s easy to skim past"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {result.attention_map.map((item) => (
                <span
                  key={`${item.section}-${item.level}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${levelStyles[item.level]}`}
                >
                  <span aria-hidden>{levelEmoji[item.level]}</span>
                  <span>{item.section}</span>
                  <span className="opacity-70">·</span>
                  <span className="opacity-90">{item.level}</span>
                </span>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

async function extractResumeText(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".pdf")) {
    return extractPdfText(file);
  }

  if (fileName.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  }

  if (
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".rtf")
  ) {
    return file.text();
  }

  throw new Error(
    "Unsupported file type. Please upload PDF, DOCX, TXT, MD, or RTF."
  );
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n");
}
