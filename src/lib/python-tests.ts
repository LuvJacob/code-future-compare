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
import json as _json, traceback as _traceback, io as _io, contextlib as _contextlib, ast as _ast
_payload = _json.loads(_request_json)
_out = _io.StringIO()
_result = {"passed": False, "actual": "Not returned", "stdout": ""}
_RULES = {
    "reverse_string": {"calls": {"reversed"}, "methods": {"reverse"}, "step_slices": True},
    "find_max": {"calls": {"max", "sorted"}, "methods": {"sort"}, "step_slices": False},
}
def _check_rules(tree, fn_name):
    # AST-based, so comments and string literals never trigger false positives.
    rule = _RULES.get(fn_name, {"calls": set(), "methods": set(), "step_slices": False})
    for node in _ast.walk(tree):
        if isinstance(node, (_ast.Import, _ast.ImportFrom)):
            return "Imports are not allowed in this challenge."
        if isinstance(node, _ast.Call):
            f = node.func
            if isinstance(f, _ast.Name) and f.id in rule["calls"]:
                return "Restriction violated: " + f.id + "() is not allowed in this challenge."
            if isinstance(f, _ast.Attribute) and f.attr in rule["methods"]:
                return "Restriction violated: ." + f.attr + "() is not allowed in this challenge."
        if rule["step_slices"] and isinstance(node, _ast.Slice) and node.step is not None:
            return "Restriction violated: slicing-based reversal (e.g. [::-1]) is not allowed."
    return None
try:
    _tree = _ast.parse(_payload["code"], "<submission>")
    _violation = _check_rules(_tree, _payload["functionName"])
    if _violation:
        raise ValueError(_violation)
    with _contextlib.redirect_stdout(_out), _contextlib.redirect_stderr(_out):
        _namespace = {"__name__": "__submission__"}
        exec(compile(_tree, "<submission>", "exec"), _namespace)
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