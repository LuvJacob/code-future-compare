import { useRef } from "react";

const KW =
  /\b(def|return|if|elif|else|for|while|in|and|or|not|True|False|None|pass|import|from|class|lambda|with|as|try|except|finally|raise|break|continue|is|del|global|nonlocal|assert|yield)\b/;
const TOKEN =
  /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/gm;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code: string) {
  let out = "";
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    out += esc(code.slice(last, i));
    const t = esc(m[0]);
    if (m[1]) out += `<span class="tok-comment">${t}</span>`;
    else if (m[2]) out += `<span class="tok-string">${t}</span>`;
    else if (m[3]) out += `<span class="tok-number">${t}</span>`;
    else if (KW.test(m[0])) out += `<span class="tok-keyword">${t}</span>`;
    else out += t;
    last = i + m[0].length;
  }
  return out + esc(code.slice(last)) + "\n";
}

export function CodeEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const pre = useRef<HTMLPreElement>(null);
  return (
    <div className="code-surface relative h-[420px] overflow-hidden rounded-md border">
      <pre
        ref={pre}
        aria-hidden
        className="code-layer pointer-events-none absolute inset-0 overflow-hidden"
        dangerouslySetInnerHTML={{ __html: highlight(value) }}
      />
      <textarea
        aria-label="Python code editor"
        spellCheck={false}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (pre.current) {
            pre.current.scrollTop = e.currentTarget.scrollTop;
            pre.current.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const t = e.currentTarget;
            const s = t.selectionStart;
            const v = value.slice(0, s) + "    " + value.slice(t.selectionEnd);
            onChange(v);
            requestAnimationFrame(() => (t.selectionStart = t.selectionEnd = s + 4));
          }
        }}
        className="code-layer code-input absolute inset-0 resize-none disabled:cursor-not-allowed"
      />
    </div>
  );
}
