-- =============================================================================
-- RAI1903 — Ejecutar en Supabase → SQL Editor (una vez)
-- Corrige: "column cms_inline_overrides.season_id does not exist"
--           FK season_id → cms_seasons (temporadas deben existir ANTES)
-- =============================================================================
-- Si probaste API-Football antes, ejecuta primero: supabase/DROP_API_FOOTBALL.sql
-- Es idempotente: puedes ejecutarlo varias veces.
-- =============================================================================

-- 1) Catálogo de temporadas (OBLIGATORIO antes de FKs)
create table if not exists public.cms_seasons (
  id text primary key,
  label text not null,
  is_default boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.cms_seasons (id, label, is_default, sort_order, published)
values
  ('2025-26', '25/26', true, 0, true),
  ('2026-27', '26/27', false, 1, false)
on conflict (id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

delete from public.cms_seasons where id = '2024-25';

-- 2) Bundles por temporada (plantilla, calendario, crónicas…)
create table if not exists public.cms_season_bundles (
  season_id text not null references public.cms_seasons (id) on delete cascade,
  scope text not null check (scope in ('masculino', 'femenino', 'global', 'filial', 'juvenil')),
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
      'teams'
    )
  );

-- 3) Overrides por temporada
alter table public.cms_inline_overrides
  add column if not exists season_id text default '2025-26';

update public.cms_inline_overrides
set season_id = '2025-26'
where season_id is null;

-- Filas huérfanas: temporada inexistente → 2025-26
update public.cms_inline_overrides o
set season_id = '2025-26'
where not exists (select 1 from public.cms_seasons s where s.id = o.season_id);

alter table public.cms_inline_overrides
  alter column season_id set not null;

alter table public.cms_inline_overrides
  drop constraint if exists cms_inline_overrides_season_id_fkey;

alter table public.cms_inline_overrides
  add constraint cms_inline_overrides_season_id_fkey
  foreign key (season_id) references public.cms_seasons (id) on delete cascade;

alter table public.cms_inline_overrides drop constraint if exists cms_inline_overrides_pkey;

do $$
begin
  alter table public.cms_inline_overrides
    add primary key (season_id, key);
exception
  when duplicate_object then null;
end $$;

create index if not exists cms_inline_overrides_season_idx
  on public.cms_inline_overrides (season_id);

-- =============================================================================
-- Después de ejecutar:
-- 1. Recarga la web
-- 2. Editar → Temporadas → "Subir mock actual a 2025-26" (primera vez)
--
-- Si al guardar fichajes falla cms_season_bundles_bundle_key_check, ejecuta solo:
--   supabase/FIX_TRANSFERS_BUNDLE.sql
-- (o vuelve a ejecutar este archivo; la sección de bundles es idempotente).
-- =============================================================================
