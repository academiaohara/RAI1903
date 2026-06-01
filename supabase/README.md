# SQL para Supabase

Ejecuta en **Supabase → SQL Editor** (copiar y pegar el archivo completo).

## Orden recomendado

| Paso | Archivo | Cuándo |
|------|---------|--------|
| 1 | [`DROP_API_FOOTBALL.sql`](./DROP_API_FOOTBALL.sql) | Solo si probaste la integración API-Football (tablas `api_football_*`) |
| 2 | [`APPLY_CMS_MIGRATIONS.sql`](./APPLY_CMS_MIGRATIONS.sql) | Siempre (temporadas, bundles, `season_id` en overrides) |

Después en la web: **Editar → Temporadas → Subir mock actual a `2025-26`**.

## Migraciones automáticas (CLI)

Si usas `supabase db push`, los archivos en `migrations/` se aplican por fecha. El script unificado `APPLY_CMS_MIGRATIONS.sql` es equivalente y más fácil desde el panel web.

## API-Football

No forma parte del proyecto actual. No configures `API_FOOTBALL_KEY` ni Edge Functions de sync.
