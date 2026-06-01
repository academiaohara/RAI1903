-- API-Football sync: equipos, partidos, eventos, estadísticas, alineaciones y clasificación.
-- El frontend solo lee estas tablas (RLS: lectura pública; escritura vía service role en Edge Functions).

create table if not exists public.teams (
  api_football_id int primary key,
  name text not null,
  logo_url text,
  local_slug text,
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  api_football_fixture_id bigint primary key,
  season int not null,
  league_id int not null,
  league_name text not null default '',
  round text,
  matchday int,
  home_team_id int not null references public.teams (api_football_id),
  away_team_id int not null references public.teams (api_football_id),
  kickoff_at timestamptz not null,
  venue_name text,
  venue_city text,
  status_short text not null default 'NS',
  status_long text,
  home_goals int,
  away_goals int,
  is_aviles_match boolean not null default false,
  video_url text,
  detail_synced_at timestamptz,
  lineup_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists matches_season_kickoff_idx on public.matches (season, kickoff_at);
create index if not exists matches_aviles_kickoff_idx on public.matches (is_aviles_match, kickoff_at)
  where is_aviles_match = true;
create index if not exists matches_detail_pending_idx on public.matches (kickoff_at)
  where detail_synced_at is null and status_short in ('FT', 'AET', 'PEN');

create table if not exists public.match_events (
  id bigserial primary key,
  fixture_id bigint not null references public.matches (api_football_fixture_id) on delete cascade,
  elapsed int,
  extra int,
  team_side text not null check (team_side in ('home', 'away')),
  event_type text not null,
  detail text,
  player_name text,
  assist_name text,
  player_id int,
  sort_order int not null default 0,
  raw jsonb,
  unique (fixture_id, sort_order)
);

create index if not exists match_events_fixture_idx on public.match_events (fixture_id, sort_order);

create table if not exists public.match_statistics (
  fixture_id bigint not null references public.matches (api_football_fixture_id) on delete cascade,
  team_side text not null check (team_side in ('home', 'away')),
  stat_type text not null,
  stat_value text not null,
  primary key (fixture_id, team_side, stat_type)
);

create table if not exists public.lineups (
  fixture_id bigint not null references public.matches (api_football_fixture_id) on delete cascade,
  team_side text not null check (team_side in ('home', 'away')),
  formation text,
  coach_name text,
  starters jsonb not null default '[]'::jsonb,
  substitutes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (fixture_id, team_side)
);

create table if not exists public.standings (
  season int not null,
  league_id int not null,
  team_id int not null references public.teams (api_football_id),
  rank int not null,
  points int not null default 0,
  goals_diff int not null default 0,
  form text,
  played int not null default 0,
  won int not null default 0,
  drawn int not null default 0,
  lost int not null default 0,
  goals_for int not null default 0,
  goals_against int not null default 0,
  description text,
  updated_at timestamptz not null default now(),
  primary key (season, league_id, team_id)
);

create index if not exists standings_league_season_rank_idx
  on public.standings (league_id, season, rank);

create table if not exists public.sync_logs (
  id bigserial primary key,
  job_name text not null,
  status text not null check (status in ('started', 'success', 'error')),
  message text,
  meta jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists sync_logs_job_started_idx on public.sync_logs (job_name, started_at desc);

-- Liga principal del Avilés (se rellena en el primer sync de fixtures)
create table if not exists public.football_sync_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.match_statistics enable row level security;
alter table public.lineups enable row level security;
alter table public.standings enable row level security;
alter table public.sync_logs enable row level security;
alter table public.football_sync_config enable row level security;

create policy "teams_public_read" on public.teams for select using (true);
create policy "matches_public_read" on public.matches for select using (true);
create policy "match_events_public_read" on public.match_events for select using (true);
create policy "match_statistics_public_read" on public.match_statistics for select using (true);
create policy "lineups_public_read" on public.lineups for select using (true);
create policy "standings_public_read" on public.standings for select using (true);

create policy "football_sync_config_public_read"
  on public.football_sync_config for select using (true);

-- video_url editable por editores CMS
create policy "matches_editor_update_video"
  on public.matches for update
  using (public.is_editor())
  with check (public.is_editor());

-- sync_logs solo lectura para editores (depuración)
create policy "sync_logs_editor_read"
  on public.sync_logs for select
  using (public.is_editor());
