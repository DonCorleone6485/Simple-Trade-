# AGENTS.md

Instructions for AI coding agents working in this repo.

## Stack

- Frontend: React 19 + Vite + TypeScript + Tailwind
- Auth: Clerk
- Database: Supabase (Postgres, RLS enabled)
- AI: Groq (`llama-3.3-70b-versatile`)
- Hosting: Vercel (auto-deploy from `main`)
- Repo: github.com/DonCorleone6485/Simple-Trade-
- Domain: simpletradejournal.io

## Access already configured on this machine

- **git/GitHub**: push access to `main` is authenticated (GitHub PAT via osxkeychain). `git push origin main` works directly, no extra auth step.
- **Vercel CLI**: logged in and linked (`ali-saygins-projects/simple-trade`). Do **not** run `vercel deploy` manually — pushing to `main` on GitHub triggers Vercel's own auto build+deploy. Only use the Vercel CLI for inspection (`vercel ls`, `vercel inspect`, checking env vars), not for deploying.
- **Supabase CLI**: logged in and linked to project ref `obaqhbfaeejepocsdgiv` (`supabase link`). Use `supabase projects list` to confirm status is `ACTIVE_HEALTHY` before relying on the DB. `supabase/.temp/` is local CLI cache — gitignored, never commit it.

## Workflow expectations

- Make code changes, then commit and push to `main` yourself — the user does not want to deploy manually. Vercel picks up the push automatically.
- Follow the repo's standard commit workflow: check `git status`/`git diff` before staging, stage specific files (never blind `git add -A`), write a commit message that explains why, then push.
- Never commit secrets. Real Supabase/Clerk/Groq keys live in Vercel env vars and local `.env.local` (gitignored) — see `.env.example` for the shape only.
- `src/lib/supabase.ts` currently has the Supabase URL/anon key hardcoded (env vars didn't resolve correctly in Vite for this project) — this is intentional, not a bug to "fix" silently. If you change this, verify it actually works in a real Vite build before committing.

## Environment variables (set in Vercel, not committed)

- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `GROQ_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

See [NOTES.md](NOTES.md) for the running log of project decisions and TODOs.
