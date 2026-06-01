# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 16 frontend application (App Router, React 19, TypeScript, Tailwind CSS v4). Competition data (plantilla, jornadas, temporadas) is edited via Supabase CMS; **static images** (escudos, estadios, logos) live in the repo under `/public` and are associated to teams per season in Supabase (`team_crests` bundle). Fallback competition data remains in `/data/mock.ts` until seeded to Supabase.

### Running the app

```bash
npm run dev        # Starts Next.js dev server on http://localhost:3000
```

### Lint, typecheck, build

```bash
npm run lint       # ESLint with --max-warnings=0 (zero warnings policy)
npm run typecheck  # tsc --noEmit (strict mode)
npm run build      # Next.js production build
```

### Key notes

- No test framework is configured (no Jest, Vitest, or Playwright). Validation relies on lint, typecheck, and manual browser testing.
- Mock data covers most of the site. **Supabase** uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Vercel / `.env.local`). Run SQL in `supabase/migrations/` (quiniela, profiles, CMS). Login is direct OAuth from the header; `/login` auto-redirects to X. Edición en línea para `rai1903fan@gmail.com` (rol `editor` en `profiles`; ver `supabase/seed-editor-profile.sql`).
- The dev server uses Turbopack for fast refresh.
- Browser state (Quiniela predictions) persists via `localStorage` only.
- Package manager is **npm** (lockfile: `package-lock.json`).
- Team crests live in `/public/escudos` (slug filenames). Upload all team PNGs to `/Escudos` (not the repo root); competition logos go in `/Competiciones`; stadium photos go in `/Estadios`. Run `npm run import:assets` to copy into `public/` and regenerate `lib/escudo-manifest.ts` and `lib/stadium-manifest.ts`. Editors assign which crest file maps to each `teamId` per season via **Editar → Escudos** (saved in Supabase, not in mock data).
