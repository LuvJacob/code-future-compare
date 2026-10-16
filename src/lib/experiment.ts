export type Mode = "traditional" | "ai";

export interface Problem {
  id: string;
  title: string;
  prompt: string;
  signature: string;
  examples: { input: string; output: string }[];
  hints: string[];
}

export const PROBLEMS: Problem[] = [
  {
    id: "reverse-string",
    title: "Reverse a String",
    prompt:
      "Write a function reverseString(s) that returns the characters of s in reverse order. Do not use any external libraries.",
    signature: "function reverseString(s) {\n  // your code here\n}\n",
    examples: [
      { input: 'reverseString("hello")', output: '"olleh"' },
      { input: 'reverseString("CSC 4330")', output: '"0334 CSC"' },
      { input: 'reverseString("")', output: '""' },
    ],
    hints: [
      "Strings in JavaScript are immutable — consider building a new string or array.",
      "One approach: split the string into an array, reverse it, then join it back.",
      "Alternative: loop from the last index (s.length - 1) down to 0, appending each character.",
      "Edge case: an empty string should return an empty string.",
    ],
  },
  {
    id: "array-max",
    title: "Find the Maximum in an Array",
    prompt:
      "Write a function findMax(nums) that returns the largest number in a non-empty array of numbers. Do not use Math.max with spread.",
    signature: "function findMax(nums) {\n  // your code here\n}\n",
    examples: [
      { input: "findMax([3, 7, 2, 9, 4])", output: "9" },
      { input: "findMax([-5, -1, -12])", output: "-1" },
      { input: "findMax([42])", output: "42" },
    ],
    hints: [
      "Initialize a variable with the first element rather than 0 — think about all-negative arrays.",
      "Iterate through the remaining elements and compare each to your current maximum.",
      "A for...of loop or a classic indexed for loop both work here.",
      "Array.prototype.reduce can express this in a single expression.",
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
}

const KEY = "csc4330-experiment-results";

export function loadResults(): ResultRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveResult(r: ResultRecord) {
  localStorage.setItem(KEY, JSON.stringify([...loadResults(), r]));
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
