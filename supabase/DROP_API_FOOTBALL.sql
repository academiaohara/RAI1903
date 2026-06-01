-- =============================================================================
-- Quitar restos de API-Football en Supabase (si llegaste a ejecutar esa migración)
-- Ejecutar en SQL Editor ANTES de APPLY_CMS_MIGRATIONS.sql si hubo conflictos.
-- El código de la web ya NO usa API-Football (fue revertido en el repo).
-- =============================================================================

-- Tablas hijas primero
drop table if exists public.match_events cascade;
drop table if exists public.match_statistics cascade;
drop table if exists public.lineups cascade;
drop table if exists public.standings cascade;

-- Solo si son las tablas de API-Football (tienen estas columnas)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'matches' and column_name = 'api_football_fixture_id'
  ) then
    execute 'drop table public.matches cascade';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'teams' and column_name = 'api_football_id'
  ) then
    execute 'drop table public.teams cascade';
  end if;
end $$;

drop table if exists public.sync_logs cascade;
drop table if exists public.football_sync_config cascade;

-- =============================================================================
-- En el panel de Supabase, borra también a mano (si existen):
--   Edge Functions → sync-season-fixtures, sync-standings, sync-match-detail, sync-aviles-lineup
--   Project Settings → Edge Functions → Secrets → API_FOOTBALL_KEY (eliminar)
-- En Vercel → Environment Variables → quitar API_FOOTBALL_KEY si la añadiste
-- =============================================================================
