# CLAUDE.md

Knowplain — Next.js 16 · React 19 · Supabase · Vercel · Playwright · shadcn.

Prefer `gh`, `supabase`, and `vercel` CLIs for repo/db/deploy. Use Context7 / Supabase MCP for live docs and schema. Do not invent APIs from memory.

## Agent skills

Skills for this repo live in `.agents/skills/` (project-local, not global). Update with `npx skills update -p`.

### Issue tracker

GitHub Issues on `veyis/knowplain.com` (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Defaults: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

