import { NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/gemini";

type RequestBody = {
  resume?: string;
  job?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const resume = body.resume?.trim();
    const job = body.job?.trim();

    if (!resume || !job) {
      return NextResponse.json(
        { error: "Both resume and job description are required." },
        { status: 400 }
      );
    }

    const result = await analyzeWithGemini(resume, job);
    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze resume.";
    const normalized = message.toLowerCase();

    if (
      normalized.includes("resource_exhausted") ||
      normalized.includes("quota exceeded") ||
      normalized.includes('"code": 429') ||
      normalized.includes("status: 429")
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini quota reached right now. Please wait about a minute and try again, or switch to a different Gemini API key/project with available quota.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
