const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];

export type AnalyzeResult = {
  match_score: number;
  key_strengths: string[];
  missing_skills: string[];
  improved_bullets: string[];
  recruiter_summary: string;
  attention_map: { section: string; level: "High" | "Medium" | "Low" }[];
};

function buildPrompt(resume: string, job: string): string {
  return `You are a professional recruiter reviewing a candidate.

Analyze the resume against the job description.

Return ONLY valid JSON with:

* match_score (number from 0 to 100)
* key_strengths (array of strings)
* missing_skills (array of strings)
* improved_bullets (array of rewritten resume bullets)
* recruiter_summary (short paragraph)
* attention_map (array of objects with section and level: High/Medium/Low)

Resume:
${resume}

Job Description:
${job}`;
}

function extractJson(text: string): AnalyzeResult {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  const parsed = JSON.parse(cleaned) as AnalyzeResult;
  return parsed;
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
  job: string
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
                  text: buildPrompt(resume, job),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      lastError = `Model ${model} failed: ${errorText}`;

      // Try the next fallback model when this one is unavailable.
      if (response.status === 404) {
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
      throw new Error(`Gemini model ${model} returned an empty response.`);
    }

    return extractJson(text);
  }

  throw new Error(`Gemini API error: ${lastError}`);
}
