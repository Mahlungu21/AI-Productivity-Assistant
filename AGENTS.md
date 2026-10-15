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

- AI calls live server-side: one-shot tools go through `runAi` (src/lib/ai.functions.ts) with per-feature prompts in src/lib/ai/prompts.server.ts; chat streams via src/routes/api/chat.ts. Why: keeps keys and prompts off the client.
- User data (saved work, tasks, activity, stats) is stored in browser localStorage via src/lib/store.ts; no sign-in. Why: demo works without accounts; move to Cloud tables if auth is added.
