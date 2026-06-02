-- =============================================================================
-- Mercado de fichajes (bundle «transfers») — ejecutar en Supabase → SQL Editor
-- Si al guardar fichajes ves:
--   cms_season_bundles_bundle_key_check
-- es que el CHECK de bundle_key es anterior a «transfers».
-- Idempotente: puedes ejecutarlo varias veces.
-- Alternativa: volver a ejecutar supabase/APPLY_CMS_MIGRATIONS.sql (sección bundles).
-- =============================================================================

alter table public.cms_season_bundles
  drop constraint if exists cms_season_bundles_bundle_key_check;

alter table public.cms_season_bundles
  add constraint cms_season_bundles_bundle_key_check
  check (
    bundle_key in (
      'fixtures',
      'squad',
      'match_articles',
      'competition_labels',
      'team_crests',
      'stadium_photos',
      'transfers',
      'competition_config',
      'teams',
      'rival_squads'
    )
  );
