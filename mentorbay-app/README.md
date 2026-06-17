# MentorBay - Next.js App

The production app for MentorBay (Next.js 14 + TypeScript + Tailwind + Supabase).
The original HTML design lives in the parent folder; this is the real build.

## Run locally

```bash
cd mentorbay-app
npm install
cp .env.local.example .env.local   # then fill in your Supabase keys (optional for now)
npm run dev
```

Open http://localhost:3000

## Status

Phase 1 in progress - public pages are being converted to components with demo data
(`src/lib/data.ts`). Supabase wiring comes next (see ../MIGRATION.md).

## Structure

- `src/app/(public)/` - public marketing pages
- `src/components/` - shared UI (nav, footer, cards, logo)
- `src/lib/data.ts` - demo data (temporary, replaced by Supabase queries)
- `src/lib/supabase/` - Supabase browser + server clients (ready for Phase 4/5)
- `public/images/` - the MentorBay image library
