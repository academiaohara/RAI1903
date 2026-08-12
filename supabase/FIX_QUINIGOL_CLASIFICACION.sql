-- =============================================================================
-- Quinigol y predicción de clasificación final (juegos)
-- Ejecutar en Supabase → SQL Editor (una vez; idempotente)
-- =============================================================================
-- Si ya ejecutaste 20250812120000_quinigol_clasificacion.sql y falló a medias,
-- basta con ejecutar ESTE archivo. No hace falta volver a lanzar la migración.
-- =============================================================================

create table if not exists public.quinigol_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  match_id text not null,
  season_id text not null default '2025-26',
  matchday int not null,
  goals_home text not null,
  goals_away text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, match_id, season_id)
);

create table if not exists public.quinigol_saved_rounds (
  user_id uuid not null references auth.users (id) on delete cascade,
  round int not null,
  season_id text not null default '2025-26',
  saved_at timestamptz not null default now(),
  primary key (user_id, round, season_id)
);

create table if not exists public.clasificacion_predictions (
  user_id uuid not null references auth.users (id) on delete cascade,
  season_id text not null default '2025-26',
  team_id text not null,
  position int not null check (position >= 1 and position <= 30),
  updated_at timestamptz not null default now(),
  primary key (user_id, season_id, team_id)
);

create table if not exists public.clasificacion_submissions (
  user_id uuid not null references auth.users (id) on delete cascade,
  season_id text not null default '2025-26',
  submitted_at timestamptz not null default now(),
  primary key (user_id, season_id)
);

alter table public.quinigol_predictions enable row level security;
alter table public.quinigol_saved_rounds enable row level security;
alter table public.clasificacion_predictions enable row level security;
alter table public.clasificacion_submissions enable row level security;

drop policy if exists "quinigol_predictions_own" on public.quinigol_predictions;
create policy "quinigol_predictions_own"
  on public.quinigol_predictions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "quinigol_saved_rounds_own" on public.quinigol_saved_rounds;
create policy "quinigol_saved_rounds_own"
  on public.quinigol_saved_rounds for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "clasificacion_predictions_own" on public.clasificacion_predictions;
create policy "clasificacion_predictions_own"
  on public.clasificacion_predictions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "clasificacion_submissions_own" on public.clasificacion_submissions;
create policy "clasificacion_submissions_own"
  on public.clasificacion_submissions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "quinigol_saved_rounds_read_participants" on public.quinigol_saved_rounds;
create policy "quinigol_saved_rounds_read_participants"
  on public.quinigol_saved_rounds for select
  to authenticated
  using (true);

drop policy if exists "quinigol_predictions_read_participants" on public.quinigol_predictions;
create policy "quinigol_predictions_read_participants"
  on public.quinigol_predictions for select
  to authenticated
  using (true);

drop policy if exists "clasificacion_predictions_read_participants" on public.clasificacion_predictions;
create policy "clasificacion_predictions_read_participants"
  on public.clasificacion_predictions for select
  to authenticated
  using (true);

drop policy if exists "clasificacion_submissions_read_participants" on public.clasificacion_submissions;
create policy "clasificacion_submissions_read_participants"
  on public.clasificacion_submissions for select
  to authenticated
  using (true);

create index if not exists quinigol_predictions_user_season_idx
  on public.quinigol_predictions (user_id, season_id);

create index if not exists clasificacion_predictions_season_idx
  on public.clasificacion_predictions (season_id);
