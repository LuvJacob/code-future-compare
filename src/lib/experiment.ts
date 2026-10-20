export type Mode = "traditional" | "ai";

export interface Problem {
  id: string;
  title: string;
  prompt: string;
  signature: string;
  examples: { input: string; output: string }[];
}

export const PROBLEMS: Problem[] = [
  {
    id: "reverse-string",
    title: "Reverse a String",
    prompt:
      "Write a function reverse_string(s) that returns the characters of s in reverse order. Do not use any external libraries.",
    signature: "def reverse_string(s):\n    # Write your solution here\n    pass\n",
    examples: [
      { input: 'reverse_string("hello")', output: '"olleh"' },
      { input: 'reverse_string("CSC 4330")', output: '"0334 CSC"' },
      { input: 'reverse_string("")', output: '""' },
    ],
  },
  {
    id: "array-max",
    title: "Find the Maximum in a List",
    prompt:
      "Write a function find_max(nums) that returns the largest number in a non-empty list of numbers. Do not use the built-in max() function.",
    signature: "def find_max(nums):\n    # Write your solution here\n    pass\n",
    examples: [
      { input: "find_max([3, 7, 2, 9, 4])", output: "9" },
      { input: "find_max([-5, -1, -12])", output: "-1" },
      { input: "find_max([42])", output: "42" },
    ],
  },
];

export const TIME_LIMIT_SEC = 600;

export type Status = "completed" | "did-not-finish" | "timed-out";

export interface ResultRecord {
  id: string;
  mode: Mode;
  problemId: string;
  problemTitle: string;
  elapsedSec: number;
  attempts: number;
  hintsViewed: number;
  status: Status;
  finishedAt: string;
  testCasesPassed?: number;
  totalTestCases?: 3;
  lastExecutionHadError?: boolean;
  runCodeAttempts?: number;
  timeToSuccessfulSubmissionSec?: number | null;
}

const KEY = "csc4330-experiment-results";

export function loadResults(): ResultRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((row): row is ResultRecord => Boolean(row && typeof row === "object" && typeof row.id === "string" && typeof row.problemTitle === "string" && ["traditional", "ai"].includes(row.mode) && ["completed", "did-not-finish", "timed-out"].includes(row.status) && Number.isFinite(row.elapsedSec) && Number.isFinite(row.attempts) && typeof row.finishedAt === "string"));
  } catch {
    return [];
  }
}

export function saveResult(r: ResultRecord) {
  const rows = loadResults();
  if (rows.some((row) => row.id === r.id)) return;
  localStorage.setItem(KEY, JSON.stringify([...rows, r]));
}

export function clearResults() {
  localStorage.removeItem(KEY);
}

export function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const modeLabel = (m: Mode) =>
  m === "ai" ? "AI-Assisted (2026)" : "Traditional (2016)";
