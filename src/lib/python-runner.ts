import { EXECUTION_TIMEOUT_MS, RUNTIME_INIT_TIMEOUT_MS, type PythonTest, type TestResult } from "./python-tests";

export class PythonRunner {
  private stop: (() => void) | undefined;

  cancel() {
    this.stop?.();
    this.stop = undefined;
  }

  private runCase(code: string, functionName: string, test: PythonTest, onReady: () => void): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./python.worker.ts", import.meta.url), { type: "module" });
      let settled = false;
      let timer: ReturnType<typeof setTimeout>;
      const finish = (result?: TestResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        this.stop = undefined;
        if (result) resolve(result);
        else reject(new DOMException("Run cancelled", "AbortError"));
      };
      const fail = (error: string) => finish({ passed: false, actual: "Not returned", stdout: "", error });
      this.stop = () => finish();
      timer = setTimeout(() => fail("Python initialization timed out. Check your connection and try again."), RUNTIME_INIT_TIMEOUT_MS);
      worker.onerror = (event) => fail(event.message || "Unable to load Python. Check your connection and retry.");
      worker.onmessage = (event) => {
        if (settled) return;
        if (event.data.type === "ready") {
          clearTimeout(timer);
          onReady();
          timer = setTimeout(() => fail("Execution timed out after 5 seconds. The Python worker was stopped."), EXECUTION_TIMEOUT_MS);
          worker.postMessage({ type: "run", code, functionName, test });
        } else if (event.data.type === "result") finish(event.data.result);
        else if (event.data.type === "error") fail(event.data.error);
      };
      // Only source and public test inputs are sent; never session/storage data.
      worker.postMessage({ type: "init" });
    });
  }

  async run(code: string, functionName: string, cases: PythonTest[], onProgress: (message: string, results: TestResult[]) => void) {
    const results: TestResult[] = [];
    for (const [i, test] of cases.entries()) {
      onProgress(`Initializing Python · case ${i + 1} / 3`, [...results]);
      const result = await this.runCase(code, functionName, test, () => onProgress(`Running case ${i + 1} / 3`, [...results]));
      results.push(result);
      onProgress(`Finished case ${i + 1} / 3`, [...results]);
    }
    return results;
  }
}