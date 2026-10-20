import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "From English to Executable: AI in the Programming Language Loop" },
      { name: "description", content: "A CSC 4330 experiment comparing 2016 traditional programming with 2026 AI-assisted programming workflows." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "From English to Executable — CSC 4330" },
      { property: "og:description", content: "Compare traditional and AI-assisted programming workflows in a timed coding experiment." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-foreground">
          CSC 4330 · Programming Languages · Course Project
        </p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight text-foreground md:text-6xl">
          From English to Executable: <em className="text-primary">AI in the Programming Language Loop</em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A controlled classroom experiment comparing how programmers solve small problems with a
          traditional 2016 workflow versus an AI-assisted 2026 workflow.
        </p>
        <div className="mt-10 flex gap-3">
          <Link to="/experiment" className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Start Experiment
          </Link>
          <Link to="/results" className="rounded-md border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary">
            View Results
          </Link>
        </div>

        <section className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <p className="font-mono text-xs text-muted-foreground">Condition A</p>
            <h2 className="mt-1 font-serif text-2xl">Traditional Programming (2016)</h2>
            <p className="mt-2 text-sm text-muted-foreground">Problem statement and code editor only. No assistant — just the programmer, the spec, and their knowledge.</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="font-mono text-xs text-muted-foreground">Condition B</p>
            <h2 className="mt-1 font-serif text-2xl">AI-Assisted Programming (2026)</h2>
            <p className="mt-2 text-sm text-muted-foreground">Same workspace plus an assistant sidebar. In this MVP it shows predefined demo hints; Gemini API integration is planned.</p>
          </div>
        </section>

        <section className="mt-12 rounded-lg border bg-card p-6">
          <h2 className="font-serif text-xl">Protocol</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Choose a mode and a problem.</li>
            <li>Press Start — a 10-minute countdown begins.</li>
            <li>Use Run Code to execute your Python solution against the three test cases.</li>
            <li>Submit after all three tests pass, or choose Did Not Finish. Results are saved in this browser.</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Python runs in this browser. Completion is verified against the three displayed test cases; predefined hints are not live AI.
          </p>
        </section>
      </main>
    </div>
  );
}
