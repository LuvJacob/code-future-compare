import Editor, { loader, type BeforeMount, type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

loader.config({ monaco });
let configured = false;

const configure: BeforeMount = (api) => {
  (globalThis as typeof globalThis & { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = { getWorker: () => new EditorWorker() };
  if (configured) return;
  configured = true;
  api.languages.setLanguageConfiguration("python", {
    comments: { lineComment: "#" },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "(", close: ")" }, { open: "[", close: "]" }, { open: "{", close: "}" },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: '"', close: '"', notIn: ["string", "comment"] },
    ],
    indentationRules: { increaseIndentPattern: /^\s*(?:async\s+)?(?:def|class|if|elif|else|for|while|try|except|finally|with|match|case)\b.*:\s*(?:#.*)?$/, decreaseIndentPattern: /^\s*(?:elif|else|except|finally)\b.*:/ },
    onEnterRules: [{ beforeText: /^\s*(?:async\s+)?(?:def|class|if|elif|else|for|while|try|except|finally|with|match|case)\b.*:\s*(?:#.*)?$/, action: { indentAction: api.languages.IndentAction.Indent } }],
  });
  api.languages.registerCompletionItemProvider("python", {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      const keywords = ["def", "return", "if", "elif", "else", "for", "while", "in", "and", "or", "not", "True", "False", "None", "pass", "import", "from", "class", "with", "as", "try", "except", "finally", "raise", "break", "continue", "lambda", "len", "range", "print", "enumerate", "str", "list"];
      const names = new Set(model.getValue().match(/\b[A-Za-z_]\w*\b/g) ?? []);
      return { suggestions: [...new Set([...keywords, ...names])].map((label) => ({ label, insertText: label, range, kind: keywords.includes(label) ? api.languages.CompletionItemKind.Keyword : api.languages.CompletionItemKind.Variable })) };
    },
  });
};

export default function MonacoPython({ value, onChange, disabled, height = "420px" }: { value: string; onChange: (v: string) => void; disabled?: boolean; height?: string }) {
  const mount: OnMount = (editor) => {
    editor.getModel()?.updateOptions({ tabSize: 4, indentSize: 4, insertSpaces: true });
  };
  return <Editor height={height} language="python" theme="vs-dark" value={value} beforeMount={configure} onMount={mount} onChange={(v) => onChange(v ?? "")} loading={<p className="p-4 text-muted-foreground">Loading editor…</p>} options={{ readOnly: Boolean(disabled), ariaLabel: "Python code editor", fontFamily: "IBM Plex Mono, monospace", fontSize: 14, minimap: { enabled: false }, lineNumbers: "on", tabSize: 4, insertSpaces: true, detectIndentation: false, autoIndent: "full", autoClosingBrackets: "always", autoClosingQuotes: "always", matchBrackets: "always", bracketPairColorization: { enabled: true }, wordBasedSuggestions: "currentDocument", quickSuggestions: { other: true, comments: false, strings: false }, automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 } }} />;
}