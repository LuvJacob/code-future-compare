import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CodeEditor } from "@/components/CodeEditor";
import { PROBLEMS, TIME_LIMIT_SEC, fmt, saveResult, modeLabel, type Mode, type Status } from "@/lib/experiment";

export const Route = createFileRoute("/experiment")({
  head: () => ({
    meta: [
      { title: "Experiment Workspace — From English to Executable" },
      { name: "description", content: "Timed coding challenge in Traditional (2016) or AI-Assisted (2026) mode." },
      { property: "og:title", content: "Experiment Workspace — CSC 4330" },
      { property: "og:description", content: "Solve a timed JavaScript challenge with or without an assistant." },
    ],
  }),
  component: Experiment,
});

type Phase = "idle" | "running" | "done";

function Experiment() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("traditional");
  const [problemId, setProblemId] = useState(PROBLEMS[0].id);
  const problem = PROBLEMS.find((p) => p.id === problemId)!;
  const [code, setCode] = useState(problem.signature);
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const e = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(Math.min(e, TIME_LIMIT_SEC));
      if (e >= TIME_LIMIT_SEC) finish("timed-out", TIME_LIMIT_SEC);
    }, 250);
    return () => clearInterval(id);
  });

  const reset = (pid = problemId) => {
    setPhase("idle");
    setElapsed(0);
    setAttempts(0);
    setHintsShown(0);
    setLog([]);
    setCode(PROBLEMS.find((p) => p.id === pid)!.signature);
  };

  const start = () => {
    startRef.current = Date.now();
    setPhase("running");
  };

  const record = () => {
    setAttempts((a) => a + 1);
    setLog((l) => [...l, `Attempt ${attempts + 1} recorded at ${fmt(elapsed)}`]);
  };

  function finish(status: Status, el = elapsed) {
    if (phase !== "running") return;
    setPhase("done");
    saveResult({
      id: crypto.randomUUID(),
      mode,
      problemId,
      problemTitle: problem.title,
      elapsedSec: el,
      attempts,
      hintsViewed: mode === "ai" ? hintsShown : 0,
      status,
      finishedAt: new Date().toISOString(),
    });
  }

  const remaining = TIME_LIMIT_SEC - elapsed;
  const running = phase === "running";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Setup bar */}
        <div className="flex flex-wrap items-end gap-6 rounded-lg border bg-card p-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Mode</p>
            <div className="flex rounded-md border p-0.5">
              {(["traditional", "ai"] as Mode[]).map((m) => (
                <button key={m} disabled={running} onClick={() => { setMode(m); reset(); }}
                  className={`rounded px-3 py-1.5 text-sm disabled:opacity-50 ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {modeLabel(m)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Problem</p>
            <div className="flex rounded-md border p-0.5">
              {PROBLEMS.map((p) => (
                <button key={p.id} disabled={running} onClick={() => { setProblemId(p.id); reset(p.id); }}
                  className={`rounded px-3 py-1.5 text-sm disabled:opacity-50 ${problemId === p.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {p.title}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Time remaining</p>
            <p className={`font-mono text-4xl tabular-nums ${remaining <= 60 && running ? "text-destructive" : "text-foreground"}`}>{fmt(remaining)}</p>
          </div>
        </div>

        <div className={`mt-6 grid gap-6 ${mode === "ai" ? "lg:grid-cols-[1fr_320px]" : ""}`}>
          <div className="space-y-6">
            <section className="rounded-lg border bg-card p-6">
              <h1 className="font-serif text-2xl">{problem.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{problem.prompt}</p>
              <table className="mt-4 w-full text-left font-mono text-sm">
                <thead><tr className="text-xs text-muted-foreground"><th className="pb-1 font-normal">Input</th><th className="pb-1 font-normal">Expected output</th></tr></thead>
                <tbody>
                  {problem.examples.map((ex) => (
                    <tr key={ex.input} className="border-t"><td className="py-1.5">{ex.input}</td><td className="py-1.5">{ex.output}</td></tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              {phase === "idle" && (
                <p className="mb-2 text-sm text-muted-foreground">Press Start to unlock the editor and begin the 10-minute timer.</p>
              )}
              <CodeEditor value={code} onChange={setCode} disabled={!running} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={start} disabled={phase !== "idle"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40">Start</button>
                <button onClick={record} disabled={!running} className="rounded-md border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40">Record Attempt ({attempts})</button>
                <button onClick={() => finish("completed")} disabled={!running} className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground disabled:opacity-40">Mark Complete</button>
                <button onClick={() => finish("did-not-finish")} disabled={!running} className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-40">Did Not Finish</button>
                {phase === "done" && (
                  <>
                    <button onClick={() => reset()} className="ml-auto rounded-md border bg-card px-4 py-2 text-sm">New Trial</button>
                    <button onClick={() => navigate({ to: "/results" })} className="rounded-md border bg-card px-4 py-2 text-sm">View Results →</button>
                  </>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Code execution and automated tests are not implemented in this MVP; completion is self-reported.</p>
              {phase === "done" && (
                <p className="mt-3 rounded-md border bg-secondary p-3 text-sm">Trial saved: {fmt(elapsed)} elapsed, {attempts} attempt(s).</p>
              )}
              {log.length > 0 && (
                <ul className="mt-3 space-y-0.5 font-mono text-xs text-muted-foreground">{log.map((l) => <li key={l}>› {l}</li>)}</ul>
              )}
            </section>
          </div>

          {mode === "ai" && (
            <aside className="h-fit rounded-lg border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg">AI Assistant</h2>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">DEMO</span>
              </div>
              <p className="mt-2 rounded-md border border-dashed p-2 text-xs text-muted-foreground">
                Demo hints — Gemini API integration planned. These are predefined, not generated by a live AI.
              </p>
              <div className="mt-4 space-y-3">
                {problem.hints.slice(0, hintsShown).map((h, i) => (
                  <div key={h} className="rounded-md bg-secondary p-3 text-sm">
                    <p className="mb-1 font-mono text-[10px] text-muted-foreground">HINT {i + 1}</p>{h}
                  </div>
                ))}
              </div>
              <button onClick={() => setHintsShown((n) => n + 1)} disabled={!running || hintsShown >= problem.hints.length}
                className="mt-4 w-full rounded-md border px-3 py-2 text-sm disabled:opacity-40">
                {hintsShown >= problem.hints.length ? "No more hints" : `Show hint (${hintsShown}/${problem.hints.length})`}
              </button>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
