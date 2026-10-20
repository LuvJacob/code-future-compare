import { PYTHON_HARNESS, type PythonTest } from "./python-tests";
import type { PyodideInterface } from "pyodide";

let runtime: PyodideInterface | undefined;
const runtimeUrl = "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/";

self.onmessage = async (event: MessageEvent<{ type: string; code: string; functionName: string; test: PythonTest }>) => {
  try {
    if (event.data.type === "init") {
      const { loadPyodide } = await import(/* @vite-ignore */ `${runtimeUrl}pyodide.mjs`);
      runtime = await loadPyodide({ indexURL: runtimeUrl, stdin: () => null });
      self.postMessage({ type: "ready" });
      return;
    }
    if (!runtime) throw new Error("Python is not initialized");
    runtime.globals['set']("_request_json", JSON.stringify(event.data));
    const json = await runtime.runPythonAsync(PYTHON_HARNESS);
    self.postMessage({ type: "result", result: JSON.parse(String(json)) });
  } catch (error) {
    self.postMessage({ type: "error", error: error instanceof Error ? error.message : String(error) });
  }
};