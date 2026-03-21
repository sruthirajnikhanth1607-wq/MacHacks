const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
];

export type AnalyzeResult = {
  match_score: number;
  key_strengths: string[];
  missing_skills: string[];
  improved_bullets: string[];
  github_feedback: string[];
  recruiter_summary: string;
  attention_map: { section: string; level: "High" | "Medium" | "Low" }[];
  /**
   * Text-only tips: where to place content for a better chance of recruiter
   * attention, grounded in typical ~7s / F-pattern scan behavior (not a pixel heatmap).
   */
  recruiter_scan_tips: string[];
};

function buildPrompt(resume: string, job: string, githubContext?: string): string {
  const githubSection = githubContext?.trim()
    ? `\n${githubContext}\n`
    : "";

  const githubRules = githubContext?.trim()
    ? `
GitHub instructions (profile data is provided above):
* github_feedback must have 6–10 items. Write like a friendly mentor. Use "you". One actionable idea per line; keep each line skimmable (~150 characters max when possible).
* Cover: how their profile *first impression* matches the job (bio, pinned repos if inferable from names, top repos); which 1–2 repos they should feature on the resume or pin; README/demo gaps; whether languages/topics match the job; forks vs original work; stale vs active repos; concrete next steps ("Add a one-line bio that says…", "Pin X and add a screenshot to README").
* Reference specific repo *names* when helpful. Be encouraging, not harsh.
`
    : `
* github_feedback must be an empty array [].
`;

  return `You are a supportive career coach helping a student or internship applicant. Sound human: warm, direct, and easy to scan. No stiff corporate jargon. Short sentences. Prefer "you" instead of "the candidate."

Analyze the resume against the job description.

Return ONLY valid JSON with these fields:

* match_score (number from 0 to 100)
* key_strengths (array of 3–6 strings): Plain language. One idea per line. Aim under ~130 characters each so they are easy to skim.
* missing_skills (array of 3–6 strings): Friendly, specific gaps. One gap per line, ~130 characters max when possible.
* improved_bullets (array of strings): Natural resume bullets; lead with impact. Keep each bullet tight (roughly one line if read on a phone).
* github_feedback (array of strings): ${githubContext?.trim() ? "See GitHub rules below." : "Empty array []."}
* recruiter_summary (string): 2–4 short sentences only. Punchy. No filler — easy to read in one glance.
* attention_map (array of objects with section and level: High/Medium/Low)
* recruiter_scan_tips (array of 5–8 strings): Friendly tips for layout and bullet order. One tip per string; keep each under ~140 characters when possible. Start many with "Try:" or "Consider:". Do not claim you measured their eyes.

${githubRules}

Resume:
${resume}

Job Description:
${job}
${githubSection}`;
}

function extractJson(text: string): AnalyzeResult {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(cleaned) as AnalyzeResult;
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const maybeJson = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(maybeJson) as AnalyzeResult;
    }
    throw new Error("Model returned non-JSON output.");
  }
}

function normalizeResult(result: AnalyzeResult): AnalyzeResult {
  return {
    match_score: result.match_score,
    key_strengths: result.key_strengths || [],
    missing_skills: result.missing_skills || [],
    improved_bullets: result.improved_bullets || [],
    github_feedback: result.github_feedback || [],
    recruiter_summary: result.recruiter_summary || "",
    attention_map: result.attention_map || [],
    recruiter_scan_tips: result.recruiter_scan_tips || [],
  };
}

async function listAvailableModels(apiKey: string): Promise<string[]> {
  const response = await fetch(`${GEMINI_BASE_URL}?key=${apiKey}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    models?: Array<{
      name?: string;
      supportedGenerationMethods?: string[];
    }>;
  };

  return (data.models || [])
    .filter(
      (model) =>
        model.name &&
        model.name.startsWith("models/") &&
        model.supportedGenerationMethods?.includes("generateContent")
    )
    .map((model) => model.name!.replace("models/", ""));
}

export async function analyzeWithGemini(
  resume: string,
  job: string,
  githubContext?: string
): Promise<AnalyzeResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const discoveredModels = await listAvailableModels(apiKey);
  const priority = configuredModel
    ? [configuredModel, ...DEFAULT_MODELS, ...discoveredModels]
    : [...DEFAULT_MODELS, ...discoveredModels];
  const modelsToTry = [...new Set(priority)];

  let lastError = "Unknown Gemini API error.";

  for (const model of modelsToTry) {
    const response = await fetch(
      `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(resume, job, githubContext),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      lastError = `Model ${model} failed: ${errorText}`;

      if (response.status === 404 || response.status === 429) {
        continue;
      }
      throw new Error(`Gemini API error: ${lastError}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      lastError = `Gemini model ${model} returned an empty response.`;
      continue;
    }

    try {
      return normalizeResult(extractJson(text));
    } catch (error) {
      lastError =
        error instanceof Error
          ? `Model ${model} JSON parsing failed: ${error.message}`
          : `Model ${model} JSON parsing failed.`;
      continue;
    }
  }

  throw new Error(`Gemini API error: ${lastError}`);
}
