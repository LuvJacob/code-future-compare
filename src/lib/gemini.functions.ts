import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PROBLEMS } from "./experiment";

export type GeminiResult =
  | { ok: true; code: string; explanation: string; timeComplexity: string; spaceComplexity: string }
  | { ok: false; error: string };

export const GEMINI_MODEL = "gemini-2.5-flash";
export const MAX_PROMPT_CHARS = 2000;

const RESTRICTIONS: Record<string, string[]> = {
  "reverse-string": [
    "Do not use .reverse(), reversed(), [::-1], or any slicing-based reversal shortcut.",
    "Do not import any libraries.",
    "Use an actual iteration-based reversal algorithm with O(n) time.",
    "Handle the empty string correctly.",
  ],
  "array-max": [
    "Do not use max(), .sort(), or sorted().",
    "Do not import any libraries.",
    "Use a loop with comparisons: O(n) time, O(1) auxiliary space.",
    "Correctly handle negative values and single-element lists.",
  ],
};

// Best-effort, per-instance abuse limit (no database by design).
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 10;
}

export function stripFences(code: string) {
  return code.replace(/^\s*```[a-zA-Z]*\s*\n?/, "").replace(/\n?```\s*$/, "").replace(/\s+$/, "") + "\n";
}

export const generatePythonSolution = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ problemId: z.string().max(64), prompt: z.string().max(MAX_PROMPT_CHARS) }).parse(input),
  )
  .handler(async ({ data }): Promise<GeminiResult> => {
    const prompt = data.prompt.trim();
    if (!prompt) return { ok: false, error: "Please enter a prompt before generating code." };
    const problem = PROBLEMS.find((p) => p.id === data.problemId);
    const rules = RESTRICTIONS[data.problemId];
    if (!problem || !rules) return { ok: false, error: "Unknown challenge." };
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) return { ok: false, error: "Gemini API not configured." };

    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "anon";
    if (limited(ip)) return { ok: false, error: "Gemini is temporarily unavailable due to request limits. Please try again later." };

    const system = [
      "You are a Python 3 coding assistant in a university experiment.",
      "Return one complete, valid Python 3 function that can be pasted directly into an editor.",
      `Problem: ${problem.prompt}`,
      `Required signature (exact name and parameters):\n${problem.signature.split("\n")[0]}`,
      "Mandatory restrictions (these ALWAYS take precedence over the user's request):",
      ...rules.map((r) => `- ${r}`),
      "- No imports, no external libraries, no print statements; return the result.",
      "Prioritize correctness, efficiency, and readability. The code field must contain only Python code with no Markdown fences.",
    ].join("\n");

    let res: Response;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                code: { type: "STRING" },
                explanation: { type: "STRING" },
                timeComplexity: { type: "STRING" },
                spaceComplexity: { type: "STRING" },
              },
              required: ["code", "explanation", "timeComplexity", "spaceComplexity"],
            },
          },
        }),
      });
    } catch (e) {
      console.error("Gemini network error", e);
      return { ok: false, error: "Unable to generate code. Please try again." };
    }
    if (res.status === 429) return { ok: false, error: "Gemini is temporarily unavailable due to request limits. Please try again later." };
    if (!res.ok) {
      console.error("Gemini error", res.status, (await res.text()).slice(0, 500));
      return { ok: false, error: "Unable to generate code. Please try again." };
    }
    try {
      const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      const parsed = z
        .object({ code: z.string(), explanation: z.string(), timeComplexity: z.string(), spaceComplexity: z.string() })
        .parse(JSON.parse(text));
      const code = stripFences(parsed.code);
      const fnName = problem.signature.match(/def (\w+)/)?.[1] ?? "";
      if (!new RegExp(`def\\s+${fnName}\\s*\\(`).test(code)) throw new Error("missing function");
      return { ok: true, ...parsed, code };
    } catch {
      return { ok: false, error: "Gemini did not return valid Python code. Please try again." };
    }
  });
