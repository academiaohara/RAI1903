-- Valoraciones de jugadores por partido (usuarios autenticados)
create table if not exists public.match_player_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  match_id text not null,
  player_id text not null,
  season_id text not null default '2025-26',
  gender text not null check (gender in ('masculino', 'femenino')),
  rating numeric(4, 1) not null check (rating >= 0 and rating <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id, player_id, season_id)
);

create index if not exists match_player_ratings_match_idx
  on public.match_player_ratings (match_id, season_id);

alter table public.match_player_ratings enable row level security;

drop policy if exists "match_player_ratings_select" on public.match_player_ratings;
create policy "match_player_ratings_select"
  on public.match_player_ratings for select
  using (true);

drop policy if exists "match_player_ratings_own_write" on public.match_player_ratings;
drop policy if exists "match_player_ratings_own_insert" on public.match_player_ratings;
drop policy if exists "match_player_ratings_own_update" on public.match_player_ratings;
drop policy if exists "match_player_ratings_own_delete" on public.match_player_ratings;

create policy "match_player_ratings_own_insert"
  on public.match_player_ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "match_player_ratings_own_update"
  on public.match_player_ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "match_player_ratings_own_delete"
  on public.match_player_ratings for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_match_player_ratings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists match_player_ratings_updated_at on public.match_player_ratings;
create trigger match_player_ratings_updated_at
  before update on public.match_player_ratings
  for each row
  execute function public.set_match_player_ratings_updated_at();
