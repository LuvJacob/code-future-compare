import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { clearResults, fmt, loadResults, modeLabel, type ResultRecord, type Mode } from "@/lib/experiment";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results Dashboard — From English to Executable" },
      { name: "description", content: "Recorded experiment trials: mode, problem, elapsed time, attempts, and completion status." },
      { property: "og:title", content: "Results Dashboard — CSC 4330" },
      { property: "og:description", content: "Compare traditional vs AI-assisted programming trial results." },
    ],
  }),
  component: Results,
});

const statusText = { completed: "Completed", "did-not-finish": "Did not finish", "timed-out": "Timed out" };

function Results() {
  const [rows, setRows] = useState<ResultRecord[]>([]);
  useEffect(() => setRows(loadResults()), []);

  const summary = (m: Mode) => {
    const r = rows.filter((x) => x.mode === m);
    const done = r.filter((x) => x.status === "completed");
    return {
      n: r.length,
      rate: r.length ? Math.round((done.length / r.length) * 100) : null,
      avg: done.length ? Math.round(done.reduce((s, x) => s + x.elapsedSec, 0) / done.length) : null,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-3xl">Results Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Only trials actually run in this browser are shown. Stored locally.</p>
          </div>
          {rows.length > 0 && (
            <button onClick={() => { if (confirm("Delete all recorded trials?")) { clearResults(); setRows([]); } }}
              className="rounded-md border bg-card px-4 py-2 text-sm text-destructive">Clear all</button>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(["traditional", "ai"] as Mode[]).map((m) => {
            const s = summary(m);
            return (
              <div key={m} className="rounded-lg border bg-card p-5">
                <p className="text-sm font-medium">{modeLabel(m)}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Trials</p><p className="font-mono text-2xl">{s.n}</p></div>
                  <div><p className="text-xs text-muted-foreground">Completion</p><p className="font-mono text-2xl">{s.rate === null ? "—" : `${s.rate}%`}</p></div>
                  <div><p className="text-xs text-muted-foreground">Avg time (done)</p><p className="font-mono text-2xl">{s.avg === null ? "—" : fmt(s.avg)}</p></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No trials recorded yet. <Link to="/experiment" className="text-primary underline">Run the experiment</Link>.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <tr>{["#", "Mode", "Problem", "Elapsed", "Attempts", "Hints", "Status", "Finished"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{i + 1}</td>
                    <td className="px-4 py-3">{modeLabel(r.mode)}</td>
                    <td className="px-4 py-3">{r.problemTitle}</td>
                    <td className="px-4 py-3 font-mono">{fmt(r.elapsedSec)}</td>
                    <td className="px-4 py-3 font-mono">{r.attempts}</td>
                    <td className="px-4 py-3 font-mono">{r.mode === "ai" ? r.hintsViewed : "n/a"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "completed" ? "bg-success text-success-foreground" : "bg-secondary text-foreground"}`}>{statusText[r.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.finishedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
