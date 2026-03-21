"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

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
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-blue-100 text-blue-700",
};

const levelEmoji: Record<AttentionLevel, string> = {
  High: "🔴",
  Medium: "🟡",
  Low: "🔵",
};

export default function AnalyzePage() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
      <p className="mb-6 text-center text-sm text-slate-500">
        <Link
          href="/"
          className="font-medium text-slate-700 underline-offset-4 hover:underline"
        >
          ← Back to home
        </Link>
      </p>
      <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          RecruiterAI
        </h1>
        <p className="mt-2 text-slate-600">Optimize your resume in seconds</p>

        <form onSubmit={handleAnalyze} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="resume"
              className="mb-2 block text-sm font-semibold text-slate-700"
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
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-slate-500">
                Upload PDF, DOCX, TXT, MD, or RTF. You can still paste/edit
                text below.
              </p>
              {uploadedFileName && (
                <p className="mt-1 text-xs text-slate-600">
                  Loaded file: {uploadedFileName}
                </p>
              )}
              {parsingResume && (
                <p className="mt-1 text-xs font-medium text-slate-700">
                  Parsing resume file...
                </p>
              )}
            </div>
            <textarea
              id="resume"
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              rows={10}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Paste your resume here..."
            />
          </div>

          <div>
            <label
              htmlFor="job"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Job Description
            </label>
            <textarea
              id="job"
              value={job}
              onChange={(event) => setJob(event.target.value)}
              rows={10}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Paste the job description here..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || parsingResume}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      {result && (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Match Score
            </h2>
            <p className="mt-3 text-center text-6xl font-bold text-slate-900">
              {result.match_score}
            </p>
          </article>

          <Card title="Key Strengths" items={result.key_strengths} />
          <Card title="Missing Skills" items={result.missing_skills} />
          <Card title="Improved Bullets" items={result.improved_bullets} />

          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Recruiter Summary
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {result.recruiter_summary}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Attention Map
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {result.attention_map.map((item) => (
                <span
                  key={`${item.section}-${item.level}`}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${levelStyles[item.level]}`}
                >
                  {levelEmoji[item.level]} {item.section} - {item.level}
                </span>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
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
