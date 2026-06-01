-- =============================================================================
-- RAI1903 — Ejecutar en Supabase → SQL Editor (una vez)
-- Corrige: "column cms_inline_overrides.season_id does not exist"
-- =============================================================================
-- Orden: 1) temporadas + bundles + overrides   2) escudos (bundle team_crests)
-- Es idempotente: puedes ejecutarlo varias veces sin romper datos existentes.
-- =============================================================================

-- --- Migración 20250601120000_cms_season_bundles.sql ---

create table if not exists public.cms_season_bundles (
  season_id text not null references public.cms_seasons (id) on delete cascade,
  scope text not null check (scope in ('masculino', 'femenino', 'global')),
  bundle_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (season_id, scope, bundle_key)
);

create index if not exists cms_season_bundles_season_idx
  on public.cms_season_bundles (season_id);

alter table public.cms_season_bundles enable row level security;

drop policy if exists "cms_season_bundles_read" on public.cms_season_bundles;
create policy "cms_season_bundles_read"
  on public.cms_season_bundles for select
  using (true);

drop policy if exists "cms_season_bundles_editor" on public.cms_season_bundles;
create policy "cms_season_bundles_editor"
  on public.cms_season_bundles for all
  using (public.is_editor())
  with check (public.is_editor());

-- Overrides por temporada
alter table public.cms_inline_overrides
  add column if not exists season_id text default '2025-26';

update public.cms_inline_overrides
set season_id = '2025-26'
where season_id is null;

alter table public.cms_inline_overrides
  alter column season_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'cms_inline_overrides_season_id_fkey'
  ) then
    alter table public.cms_inline_overrides
      add constraint cms_inline_overrides_season_id_fkey
      foreign key (season_id) references public.cms_seasons (id) on delete cascade;
  end if;
end $$;

alter table public.cms_inline_overrides drop constraint if exists cms_inline_overrides_pkey;

alter table public.cms_inline_overrides
  add primary key (season_id, key);

create index if not exists cms_inline_overrides_season_idx
  on public.cms_inline_overrides (season_id);

insert into public.cms_seasons (id, label, is_default, sort_order, published)
values
  ('2024-25', '2024/25', false, 0, true),
  ('2025-26', '2025/26', true, 1, true),
  ('2026-27', '2026/27', false, 2, false)
on conflict (id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

-- Restricción bundle_key (fixtures + escudos)
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
      'stadium_photos'
    )
  );

-- =============================================================================
-- Después de ejecutar:
-- 1. Recarga la web
-- 2. Editar → Temporadas → "Subir mock actual a 2025-26" (primera vez)
-- =============================================================================
