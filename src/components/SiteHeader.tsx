import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <Link to="/" className="shrink-0 font-serif text-lg font-semibold text-foreground">
          English → Executable
          <span className="ml-2 text-xs font-sans font-normal text-muted-foreground">CSC 4330</span>
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }} activeOptions={{ exact: true }}>Overview</Link>
          <Link to="/experiment" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Experiment</Link>
          <Link to="/results" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Results</Link>
        </nav>
      </div>
    </header>
  );
}
