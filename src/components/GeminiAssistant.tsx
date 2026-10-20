import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePythonSolution, MAX_PROMPT_CHARS, type GeminiResult } from "@/lib/gemini.functions";

const MonacoPython = lazy(() => import("./MonacoPython"));

export function GeminiAssistant({ problemId, enabled }: { problemId: string; enabled: boolean }) {
  const generate = useServerFn(generatePythonSolution);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Extract<GeminiResult, { ok: true }> | null>(null);
  const [copied, setCopied] = useState("");

  const onGenerate = async () => {
    if (loading) return;
    if (!prompt.trim()) { setError("Please enter a prompt before generating code."); return; }
    setLoading(true); setError(""); setCopied("");
    try {
      const r = await generate({ data: { problemId, prompt } });
      if (r.ok) setResult(r); else setError(r.error);
    } catch {
      setError("Unable to generate code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.code); setCopied("Copied!"); }
    catch { setCopied("Copy failed — select the code below and copy it manually."); }
  };

  return (
    <section className="mt-6 rounded-lg border bg-card p-5" aria-label="Gemini AI Assistant">
      <h2 className="flex items-center gap-2 font-serif text-lg"><Sparkles className="size-4" />Gemini AI Assistant</h2>
      <label htmlFor="gemini-prompt" className="mt-3 block text-sm font-medium">Ask Gemini</label>
      <textarea id="gemini-prompt" value={prompt} maxLength={MAX_PROMPT_CHARS} rows={3} disabled={!enabled}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe how you want Gemini to solve this Python problem..."
        className="mt-1 w-full rounded-md border bg-background p-3 text-sm disabled:opacity-50" />
      <div className="mt-2 flex items-center gap-3">
        <Button onClick={onGenerate} disabled={!enabled || loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}{loading ? "Generating…" : "Generate Code"}
        </Button>
        {!enabled && <span className="text-xs text-muted-foreground">Press Start to use the assistant.</span>}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {result && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Generated Python Solution</h3>
            <div className="flex items-center gap-2">
              {copied && <span className="text-xs text-muted-foreground">{copied}</span>}
              <Button variant="outline" size="sm" onClick={onCopy}><Copy />Copy Code</Button>
            </div>
          </div>
          <div className="code-surface overflow-hidden rounded-md border">
            <ClientOnly fallback={<pre className="p-4 font-mono text-sm">{result.code}</pre>}>
              <Suspense fallback={<pre className="p-4 font-mono text-sm">{result.code}</pre>}>
                <MonacoPython value={result.code} onChange={() => {}} disabled height={`${Math.min(320, result.code.split("\n").length * 20 + 40)}px`} />
              </Suspense>
            </ClientOnly>
          </div>
          <p className="mt-3 text-sm">{result.explanation}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">Time Complexity: {result.timeComplexity} · Space Complexity: {result.spaceComplexity}</p>
          <p className="mt-2 text-xs text-muted-foreground">AI-generated code is not verified. Paste it into the editor and click Run Code to test it.</p>
        </div>
      )}
    </section>
  );
}
