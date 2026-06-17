# MentorBay - Supabase setup (first live slice)

This wires **Browse Mentors** to live data. ~5 minutes.

## 1. Create a Supabase project
1. Go to https://supabase.com -> sign in -> **New project**.
2. Name it `mentorbay`, choose a region close to Kenya (e.g. EU West), set a database password, create.

## 2. Run the schema + seed
1. In the project, open **SQL Editor -> New query**.
2. Paste the contents of [`schema.sql`](./schema.sql) -> **Run**.
3. New query again -> paste [`seed.sql`](./seed.sql) -> **Run**.
   (You should see 12 mentors and 9 programs inserted.)

## 3. Add your keys to the app
1. In Supabase: **Project Settings -> API**. Copy the **Project URL** and the **anon public** key.
2. In `mentorbay-app/`, create `.env.local` (copy from `.env.local.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Restart the dev server: `npm run dev`.

## 4. Verify
- Open http://localhost:3000/mentors
- It now reads mentors from Supabase. To prove it's live, edit a mentor row in
  Supabase (**Table Editor -> mentors**) - e.g. change a name - refresh the page.

## How the fallback works
`src/lib/mentors.ts -> getMentors()` returns the bundled demo data when the
Supabase env vars are missing, so the app always renders. Once the keys are set
and the tables are seeded, it returns live rows instead. Every other list page
(Programs, Events...) becomes the same swap: add a `getX()` that queries Supabase
with a demo fallback, then `await` it in the page.

## Notes
- Row Level Security is on. The public **anon** key can only READ approved
  mentors / published programs - writes are blocked, which is what we want here.
- Images are served from `/public/images`; `avatar_url` / `cover_url` store those
  relative paths. When we add Supabase Storage later, we'll swap them for hosted URLs.
