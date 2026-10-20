import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const MonacoPython = lazy(() => import("./MonacoPython"));

export function CodeEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="code-surface relative h-[420px] overflow-hidden rounded-md border">
      <ClientOnly fallback={<p className="p-4 text-muted-foreground">Loading editor…</p>}>
        <Suspense fallback={<p className="p-4 text-muted-foreground">Loading editor…</p>}>
          <MonacoPython value={value} onChange={onChange} disabled={Boolean(disabled)} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
