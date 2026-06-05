-- Permite bundle «section_status» (carteles «en construcción» por sección y temporada).

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
      'rival_squads',
      'section_status'
    )
  );
