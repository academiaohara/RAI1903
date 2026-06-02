-- Permite scope «filial» en cms_season_bundles (cantera / Real Avilés B).

alter table public.cms_season_bundles
  drop constraint if exists cms_season_bundles_scope_check;

alter table public.cms_season_bundles
  add constraint cms_season_bundles_scope_check
  check (scope in ('masculino', 'femenino', 'global', 'filial', 'juvenil'));
