-- Datos de temporada (plantilla, calendario, crónicas) editables desde el CMS
create table if not exists public.cms_season_bundles (
  season_id text not null references public.cms_seasons (id) on delete cascade,
  scope text not null check (scope in ('masculino', 'femenino', 'global')),
  bundle_key text not null check (
    bundle_key in ('fixtures', 'squad', 'match_articles', 'competition_labels')
  ),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (season_id, scope, bundle_key)
);

create index if not exists cms_season_bundles_season_idx
  on public.cms_season_bundles (season_id);

alter table public.cms_season_bundles enable row level security;

create policy "cms_season_bundles_read"
  on public.cms_season_bundles for select
  using (true);

create policy "cms_season_bundles_editor"
  on public.cms_season_bundles for all
  using (public.is_editor())
  with check (public.is_editor());

-- Overrides por temporada (antes eran globales)
alter table public.cms_inline_overrides
  add column if not exists season_id text not null default '2025-26'
    references public.cms_seasons (id) on delete cascade;

alter table public.cms_inline_overrides drop constraint if exists cms_inline_overrides_pkey;

alter table public.cms_inline_overrides
  add primary key (season_id, key);

create index if not exists cms_inline_overrides_season_idx
  on public.cms_inline_overrides (season_id);

-- Catálogo inicial de temporadas
insert into public.cms_seasons (id, label, is_default, sort_order, published)
values
  ('2024-25', '2024/25', false, 0, true),
  ('2025-26', '2025/26', true, 1, true),
  ('2026-27', '2026/27', false, 2, false)
on conflict (id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;
