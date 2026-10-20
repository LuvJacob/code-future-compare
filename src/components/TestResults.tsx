import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { PythonTest, TestResult } from "@/lib/python-tests";

export function TestResults({ cases, results, progress, stale }: { cases: PythonTest[]; results: TestResult[]; progress: string; stale: boolean }) {
  if (!results.length && !progress) return null;
  return <section className="mt-4 overflow-hidden rounded-md border bg-card" aria-label="Test results" aria-live="polite">
    <div className="border-b px-4 py-3">
      <h2 className="font-medium">Test Cases Passed: {results.filter((r) => r.passed).length} / 3</h2>
      {progress && <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" />{progress}</p>}
      {stale && <p className="mt-1 text-sm text-muted-foreground">Code changed since this run. Run Code again before submitting.</p>}
    </div>
    {results.map((result, i) => <details key={i} className="border-b last:border-b-0" open={Boolean(result.error)}>
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm"><span className={result.passed ? "text-success" : "text-destructive"}>{result.passed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}</span>Test Case {i + 1}<span className={`ml-auto font-medium ${result.passed ? "text-success" : "text-destructive"}`}>{result.passed ? "Passed" : "Failed"}</span></summary>
      <dl className="grid gap-3 px-4 pb-4 text-sm sm:grid-cols-3">
        <div><dt className="text-muted-foreground">Input</dt><dd className="break-all font-mono">{JSON.stringify(cases[i]?.args[0])}</dd></div>
        <div><dt className="text-muted-foreground">Expected Output</dt><dd className="break-all font-mono">{JSON.stringify(cases[i]?.expected)}</dd></div>
        <div><dt className="text-muted-foreground">Actual Output</dt><dd className="break-all font-mono">{result.actual}</dd></div>
      </dl>
      {result.stdout && <div className="px-4 pb-4"><p className="text-xs text-muted-foreground">Stdout / stderr</p><pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-xs">{result.stdout}</pre></div>}
      {result.error && <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all px-4 pb-4 font-mono text-xs text-destructive">{result.error}</pre>}
    </details>)}
  </section>;
}