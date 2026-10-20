<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Python execution browser-only in disposable dedicated workers; initialize a fresh runtime for each case to isolate user state and start execution deadlines only after readiness.
- Keep test definitions and completion rules in browser-safe shared modules so both experiment modes use the same validation.
- Load Monaco dynamically after mount and bundle its browser workers locally to keep browser APIs outside SSR and preserve offline editor assets.
- Extend LocalStorage result records with optional analytics fields so legacy records remain readable without inventing historical test results.
- Call Gemini only from the server function in src/lib/gemini.functions.ts with trusted per-challenge restrictions; enforce challenge restrictions via AST checks in the shared Python harness so comments/strings never trigger false positives.
