# API-Football → Supabase

Arquitectura: **el frontend solo lee Supabase**. API-Football se consulta únicamente desde **Edge Functions** programadas con cron (sin marcadores en directo).

## Tablas

| Tabla | Contenido |
|-------|-----------|
| `teams` | Equipos (id API, nombre, logo, slug local opcional) |
| `matches` | Partidos, resultado, estado, `video_url` manual |
| `match_events` | Goles, tarjetas, cambios, etc. |
| `match_statistics` | Estadísticas por partido y equipo |
| `lineups` | Alineaciones (JSON starters/suplentes) |
| `standings` | Clasificación de liga |
| `sync_logs` | Registro de ejecuciones |
| `football_sync_config` | `primary_league_id` tras el primer sync |

Migración: `supabase/migrations/20250601120000_api_football_football_data.sql`

## Variables de entorno

### Edge Functions (secrets en Supabase)

```bash
supabase secrets set API_FOOTBALL_KEY=...
supabase secrets set SUPABASE_URL=https://xxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set AVILES_TEAM_ID=9632
supabase secrets set SEASON=2025
```

### Next.js (`.env.local` / Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
FOOTBALL_SEASON=2025
```

`API_FOOTBALL_KEY` y `SUPABASE_SERVICE_ROLE_KEY` **no** deben tener prefijo `NEXT_PUBLIC_`.

## Edge Functions

| Función | Endpoint API-Football | Descripción |
|---------|----------------------|-------------|
| `sync-season-fixtures` | `GET /fixtures?team=9632&season=2025` | Upsert partidos del Avilés |
| `sync-standings` | `GET /standings?league=&season=` | Clasificación (liga guardada en config) |
| `sync-match-detail` | events, lineups, statistics | Partidos FT ≥3 h sin detalle |
| `sync-aviles-lineup` | lineups | Ventana día de partido (−2 h … fin) |

Despliegue:

```bash
supabase functions deploy sync-season-fixtures
supabase functions deploy sync-standings
supabase functions deploy sync-match-detail
supabase functions deploy sync-aviles-lineup
```

Primera carga manual:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/sync-season-fixtures" -H "Authorization: Bearer $SERVICE_ROLE"
curl -X POST "$SUPABASE_URL/functions/v1/sync-standings" -H "Authorization: Bearer $SERVICE_ROLE"
```

## Cron (UTC, ver `supabase/config.toml`)

| Tarea | Schedule |
|-------|----------|
| Fixtures / resultados | `0 5 * * *` (diario 05:00) |
| Clasificación | `0 6 * * *` (diario 06:00) |
| Detalle partido | `0 * * * *` (cada hora; partidos FT +3 h) |
| Alineación Avilés | `*/30 * * * *` (cada 30 min en ventana) |

## Frontend

- `lib/football-supabase/` — lectura y mapeo a tipos de la app
- `lib/football-data.ts` — resuelve Supabase o mock
- `components/admin/MatchVideoUrlEditor` — editores CMS pueden guardar `matches.video_url`

También puedes editar `video_url` en el panel de Supabase Table Editor.

## RLS

- Lectura pública en tablas de fútbol
- Solo editores (`profiles.role = 'editor'`) pueden actualizar `matches.video_url`
- Edge Functions usan **service role** (bypass RLS)
