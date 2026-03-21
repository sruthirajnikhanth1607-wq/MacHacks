"use client";

import { RecruiterBackground } from "@/components/recruiter-background";
import { RecruiterLogo } from "@/components/recruiter-logo";
import Link from "next/link";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

type AttentionLevel = "High" | "Medium" | "Low";

type AnalysisResult = {
  match_score: number;
  key_strengths: string[];
  missing_skills: string[];
  improved_bullets: string[];
  recruiter_summary: string;
  attention_map: { section: string; level: AttentionLevel }[];
};

const levelStyles: Record<AttentionLevel, string> = {
  High: "border border-red-500/25 bg-red-500/15 text-red-200",
  Medium: "border border-amber-500/25 bg-amber-500/15 text-amber-100",
  Low: "border border-sky-500/25 bg-sky-500/15 text-sky-200",
};

const levelEmoji: Record<AttentionLevel, string> = {
  High: "🔴",
  Medium: "🟡",
  Low: "🔵",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition selection:bg-violet-500/30 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20";

type ResumeUploadState =
  | null
  | { phase: "parsing"; name: string; size: number }
  | { phase: "ready"; name: string; size: number };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
}

function fileKindLabel(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) {
    return "FILE";
  }
  return fileName.slice(dot + 1).toUpperCase();
}

function ResumeUploadCard({
  name,
  size,
  phase,
  onRemove,
}: {
  name: string;
  size: number;
  phase: "parsing" | "ready";
  onRemove?: () => void;
}) {
  const kind = fileKindLabel(name);
  const isPdf = kind === "PDF";

  if (phase === "parsing") {
    return (
      <div
        className="mt-3 flex items-start gap-3 rounded-xl border border-violet-500/35 bg-gradient-to-br from-violet-500/15 to-white/[0.02] px-4 py-3 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/25 text-violet-100">
          <svg
            className="h-6 w-6 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-white">
            {isPdf ? "Reading your PDF…" : "Reading your file…"}
          </p>
          <p className="mt-1 truncate text-sm text-zinc-300" title={name}>
            {name}
          </p>
          <p className="mt-1.5 text-xs text-zinc-500">
            {formatFileSize(size)} · extracting text for the resume field
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mt-3 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-white/[0.02] px-4 py-3 pr-12 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
      role="status"
      aria-live="polite"
    >
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
          aria-label="Remove uploaded file and clear resume text"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/25 text-emerald-200">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-emerald-100/95">
              File uploaded
            </p>
            <span className="rounded-md border border-emerald-400/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200/90">
              {kind}
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              Ready
            </span>
          </div>
          <p
            className="mt-1 truncate text-sm font-medium text-white"
            title={name}
          >
            {name}
          </p>
          <p className="mt-1.5 text-xs text-zinc-500">
            {formatFileSize(size)} · resume text loaded below — you can still
            edit it
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeUpload, setResumeUpload] = useState<ResumeUploadState>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({ resume, job }),
      });

      const payload = (await response.json()) as {
        result?: AnalysisResult;
        error?: string;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error || "Unable to analyze resume right now.");
      }

      setResult(payload.result);
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
    setResumeUpload({
      phase: "parsing",
      name: file.name,
      size: file.size,
    });

    try {
      const text = await extractResumeText(file);
      if (!text.trim()) {
        throw new Error("Uploaded file appears to be empty.");
      }

      setResume(text.trim());
      setResumeUpload({
        phase: "ready",
        name: file.name,
        size: file.size,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to parse the resume file.";
      setError(message);
      setResumeUpload(null);
    } finally {
      event.target.value = "";
    }
  };

  const isParsingFile = resumeUpload?.phase === "parsing";

  const handleRemoveUploadedFile = () => {
    setResumeUpload(null);
    setResume("");
    setResult(null);
    setError(null);
    if (resumeFileInputRef.current) {
      resumeFileInputRef.current.value = "";
    }
  };

  return (
    <div className="splash-root relative min-h-screen overflow-hidden bg-[#050508] text-zinc-100">
      <RecruiterBackground />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-8 md:px-6 md:pt-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <RecruiterLogo priority />
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">
                RecruiterAI
              </p>
              <p className="text-xs text-zinc-500">Resume ↔ job intelligence</p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
          >
            ← Home
          </Link>
        </header>

        <main className="mt-10 md:mt-12">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md md:p-8">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Analyze your fit
            </h1>
            <p className="mt-2 text-zinc-400">
              Paste a resume and job description — get match scoring, gaps, and
              stronger bullets.
            </p>

            <form onSubmit={handleAnalyze} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="resume"
                  className="mb-2 block text-sm font-semibold text-zinc-300"
                >
                  Resume
                </label>
                <div className="mb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={resumeFileInputRef}
                      id="resume-file"
                      type="file"
                      accept=".pdf,.docx,.txt,.md,.rtf"
                      onChange={handleResumeFileUpload}
                      disabled={loading || isParsingFile}
                      className="sr-only"
                      aria-label="Choose resume file to upload"
                    />
                    <label
                      htmlFor="resume-file"
                      className={`inline-flex cursor-pointer select-none rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/15 ${
                        loading || isParsingFile
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    >
                      Choose file
                    </label>
                    {!resumeUpload && (
                      <span className="text-sm text-zinc-500">
                        No file chosen
                      </span>
                    )}
                  </div>

                  {resumeUpload && (
                    <ResumeUploadCard
                      name={resumeUpload.name}
                      size={resumeUpload.size}
                      phase={resumeUpload.phase}
                      onRemove={
                        resumeUpload.phase === "ready"
                          ? handleRemoveUploadedFile
                          : undefined
                      }
                    />
                  )}

                  <p className="mt-2 text-xs text-zinc-500">
                    Upload PDF, DOCX, TXT, MD, or RTF. You can still paste/edit
                    text below.
                  </p>
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
                  htmlFor="job"
                  className="mb-2 block text-sm font-semibold text-zinc-300"
                >
                  Job description
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
                disabled={loading || isParsingFile}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.7)] transition hover:shadow-[0_0_55px_-8px_rgba(34,211,238,0.55)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 transition group-hover:brightness-110 group-disabled:brightness-75" />
                <span className="relative">
                  {loading ? "Analyzing…" : "Analyze resume"}
                </span>
              </button>
            </form>

            {error && (
              <p
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                {error}
              </p>
            )}
          </section>

          {result && (
            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-md md:col-span-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Match score
                </h2>
                <p className="mt-4 bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-center text-6xl font-bold tabular-nums text-transparent md:text-7xl">
                  {result.match_score}
                </p>
              </article>

              <Card title="Key strengths" items={result.key_strengths} />
              <Card title="Missing skills" items={result.missing_skills} />
              <Card title="Improved bullets" items={result.improved_bullets} />

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white">
                  Recruiter summary
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {result.recruiter_summary}
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md md:col-span-2">
                <h3 className="text-lg font-semibold text-white">
                  Attention map
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {result.attention_map.map((item) => (
                    <span
                      key={`${item.section}-${item.level}`}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${levelStyles[item.level]}`}
                    >
                      {levelEmoji[item.level]} {item.section} — {item.level}
                    </span>
                  ))}
                </div>
              </article>
            </section>
          )}
        </main>

        <footer className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} RecruiterAI
        </footer>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400 marker:text-zinc-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
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
