# SimpleTrade

A trading journal web app. Log trades, track performance, and get AI-assisted trade analysis.

- Frontend: React 19 + Vite + TypeScript + Tailwind
- Auth: Clerk
- Database: Supabase (Postgres)
- AI analysis: Groq (`llama-3.3-70b-versatile`)
- Hosting: Vercel — live at [simpletradejournal.io](https://simpletradejournal.io)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Clerk/Supabase/Groq keys.
3. Run the app:
   `npm run dev`

## Deployment

Pushing to `main` automatically triggers a Vercel build+deploy — no manual deploy step needed.

See [AGENTS.md](AGENTS.md) for how AI agents should work with this repo's git/Vercel/Supabase access, and [NOTES.md](NOTES.md) for the running project log.
