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
- With Supabase env vars set, **competition data** (squad, fixtures, articles) comes from `cms_season_bundles` only — not from mock. Run **`supabase/APPLY_CMS_MIGRATIONS.sql`** once in the Supabase SQL Editor (if usaste API-Football antes, ejecuta antes **`supabase/DROP_API_FOOTBALL.sql`**), then seed via **Editar → Temporadas**. Without Supabase, mock in `/data/mock.ts` is still used locally.
- Mercado de fichajes (Editar → Mercado) guarda el bundle `transfers`. Si Supabase devuelve `cms_season_bundles_bundle_key_check`, ejecuta **`supabase/FIX_TRANSFERS_BUNDLE.sql`** (o vuelve a ejecutar `APPLY_CMS_MIGRATIONS.sql`).
- **API-Football** no está en el código (revertido). No hace falta `API_FOOTBALL_KEY` ni Edge Functions de sync.
- **Supabase** uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Vercel / `.env.local`). Login is direct OAuth from the header; `/login` auto-redirects to X. Edición en línea para `rai1903fan@gmail.com` (rol `editor` en `profiles`; ver `supabase/seed-editor-profile.sql`).
- The dev server uses Turbopack for fast refresh.
- Browser state (Quiniela predictions) persists via `localStorage` only.
- Package manager is **npm** (lockfile: `package-lock.json`).
- Team crests: sube PNG a `public/escudos/` (ruta web `/escudos/…`) o a `Escudos/` en la raíz (ruta `/api/crest-file/…`). En el editor (Editar → Escudos) asocia cada equipo con la ruta; no hace falta `npm run import:assets` para escudos nuevos. Opcional: `npm run import:assets` sigue copiando desde `/Escudos` y regenerando manifests para estadios/competiciones. Editors assign which crest file maps to each `teamId` per season via **Editar → Escudos** (saved in Supabase, not in mock data).
- **Filial (cantera):** datos por temporada en `cms_season_bundles` con `scope = filial` (`squad`, `fixtures`, `competition_config`). Selector de temporada en `/cantera/filial` (mismas temporadas que el primer equipo). Edición: **Editar → Filial**. La clasificación se calcula desde los resultados; en Competición defines jornadas totales y tramos (ascenso/descenso). Si falla al guardar por scope, ejecuta `supabase/FIX_FILIAL_SCOPE.sql` o vuelve a aplicar `APPLY_CMS_MIGRATIONS.sql`.
