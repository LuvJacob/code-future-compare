import { describe, expect, it, beforeEach } from "vitest";
import { PYTHON_TESTS, canSubmit } from "@/lib/python-tests";
import { TIME_LIMIT_SEC, loadResults, saveResult, type ResultRecord } from "@/lib/experiment";

const old: ResultRecord = { id: "old", mode: "traditional", problemId: "reverse-string", problemTitle: "Reverse a String", elapsedSec: 42, attempts: 2, hintsViewed: 0, status: "completed", finishedAt: "2026-10-20T17:00:00Z" };
const pass = { passed: true, actual: "'olleh'", stdout: "" };
beforeEach(() => localStorage.clear());

describe("Classroom experiment rules", () => {
  it("keeps exactly the specified three reverse-string cases", () => {
    expect(PYTHON_TESTS["reverse-string"]).toEqual({ functionName: "reverse_string", cases: [{ args: ["hello"], expected: "olleh" }, { args: ["CSC 4330"], expected: "0334 CSC" }, { args: [""], expected: "" }] });
  });
  it("keeps exactly the specified three find-max cases", () => {
    expect(PYTHON_TESTS["array-max"]).toEqual({ functionName: "find_max", cases: [{ args: [[3, 7, 2, 9, 4]], expected: 9 }, { args: [[-5, -1, -12]], expected: -1 }, { args: [[42]], expected: 42 }] });
  });
  it("keeps the ten-minute challenge deadline", () => expect(TIME_LIMIT_SEC).toBe(600));
  it("requires all three passing results for submission", () => {
    expect(canSubmit([pass, pass, pass], "code", "code")).toBe(true);
    expect(canSubmit([pass, pass], "code", "code")).toBe(false);
    expect(canSubmit([pass, pass, { ...pass, passed: false }], "code", "code")).toBe(false);
  });
  it("invalidates completion when the code changes", () => expect(canSubmit([pass, pass, pass], "old", "new")).toBe(false));
  it("does not accept a result containing an execution error", () => expect(canSubmit([pass, pass, { ...pass, error: "SyntaxError" }], "code", "code")).toBe(false));
  it("preserves old saved records without inventing test scores", () => {
    localStorage.setItem("csc4330-experiment-results", JSON.stringify([old]));
    expect(loadResults()).toEqual([old]);
    expect(loadResults()[0].testCasesPassed).toBeUndefined();
  });
  it("saves a trial only once for the same id", () => {
    saveResult(old); saveResult(old);
    expect(loadResults()).toHaveLength(1);
  });
  it("persists one run attempt and the verified submission time", () => {
    saveResult({ ...old, id: "new", attempts: 1, runCodeAttempts: 1, testCasesPassed: 3, totalTestCases: 3, lastExecutionHadError: false, timeToSuccessfulSubmissionSec: 42 });
    expect(loadResults()[0]).toMatchObject({ attempts: 1, runCodeAttempts: 1, testCasesPassed: 3, totalTestCases: 3, timeToSuccessfulSubmissionSec: 42, status: "completed" });
  });
});