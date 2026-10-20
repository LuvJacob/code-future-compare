export interface PythonTest {
  args: [string | number[]];
  expected: string | number;
}

export const PYTHON_TESTS: Record<string, { functionName: string; cases: PythonTest[] }> = {
  "reverse-string": {
    functionName: "reverse_string",
    cases: [
      { args: ["hello"], expected: "olleh" },
      { args: ["CSC 4330"], expected: "0334 CSC" },
      { args: [""], expected: "" },
    ],
  },
  "array-max": {
    functionName: "find_max",
    cases: [
      { args: [[3, 7, 2, 9, 4]], expected: 9 },
      { args: [[-5, -1, -12]], expected: -1 },
      { args: [[42]], expected: 42 },
    ],
  },
};

export interface TestResult {
  passed: boolean;
  actual: string;
  stdout: string;
  error?: string;
}

export const EXECUTION_TIMEOUT_MS = 5000;
export const RUNTIME_INIT_TIMEOUT_MS = 60000;

export function canSubmit(results: TestResult[], testedCode: string | null, code: string) {
  return testedCode === code && results.length === 3 && results.every((r) => r.passed && !r.error);
}

// Run in a fresh runtime for EACH case, including fresh modules and builtins.
// Arguments and code are data, never interpolated into Python source.
export const PYTHON_HARNESS = `
import json as _json, traceback as _traceback, io as _io, contextlib as _contextlib
_payload = _json.loads(_request_json)
_out = _io.StringIO()
_result = {"passed": False, "actual": "Not returned", "stdout": ""}
try:
    with _contextlib.redirect_stdout(_out), _contextlib.redirect_stderr(_out):
        _namespace = {"__name__": "__submission__"}
        exec(compile(_payload["code"], "<submission>", "exec"), _namespace)
        _fn = _namespace.get(_payload["functionName"])
        if not callable(_fn):
            raise NameError("Expected function " + _payload["functionName"] + " was not defined")
        _actual = _fn(*_payload["test"]["args"])
        _expected = _payload["test"]["expected"]
        _result["actual"] = repr(_actual)[:10000]
        _result["passed"] = type(_actual) is type(_expected) and _actual == _expected
except BaseException:
    _result["error"] = _traceback.format_exc()[-10000:]
_result["stdout"] = _out.getvalue()[:10000]
_json.dumps(_result)
`;