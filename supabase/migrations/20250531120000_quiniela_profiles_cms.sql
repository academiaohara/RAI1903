-- Perfiles (rol editor para CMS)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Quiniela (por usuario)
create table if not exists public.quiniela_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  match_id text not null,
  season_id text not null default '2025-26',
  matchday int not null,
  outcome text,
  goals_home text,
  goals_away text,
  scorer text,
  updated_at timestamptz not null default now(),
  unique (user_id, match_id, season_id)
);

create table if not exists public.quiniela_saved_rounds (
  user_id uuid not null references auth.users (id) on delete cascade,
  round int not null,
  season_id text not null default '2025-26',
  saved_at timestamptz not null default now(),
  primary key (user_id, round, season_id)
);

alter table public.quiniela_predictions enable row level security;
alter table public.quiniela_saved_rounds enable row level security;

create policy "quiniela_predictions_own"
  on public.quiniela_predictions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "quiniela_saved_rounds_own"
  on public.quiniela_saved_rounds for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- CMS
create table if not exists public.cms_seasons (
  id text primary key,
  label text not null,
  is_default boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_news_items (
  id text primary key default gen_random_uuid()::text,
  season_id text references public.cms_seasons (id) on delete set null,
  channel text not null check (channel in ('club', 'prensa')),
  source text not null default '',
  published_at timestamptz not null default now(),
  title text not null,
  excerpt text not null default '',
  url text not null,
  image_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  teams text[] not null default '{}',
  player_ids text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_players (
  id text not null,
  season_id text not null,
  squad text not null check (squad in ('masculino', 'femenino')),
  payload jsonb not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id, season_id, squad)
);

alter table public.cms_seasons enable row level security;
alter table public.cms_news_items enable row level security;
alter table public.cms_players enable row level security;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'editor'
  );
$$;

create policy "cms_seasons_read"
  on public.cms_seasons for select
  using (published = true or public.is_editor());

create policy "cms_seasons_editor"
  on public.cms_seasons for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "cms_news_read"
  on public.cms_news_items for select
  using (published = true or public.is_editor());

create policy "cms_news_editor"
  on public.cms_news_items for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "cms_players_read"
  on public.cms_players for select
  using (published = true or public.is_editor());

create policy "cms_players_editor"
  on public.cms_players for all
  using (public.is_editor())
  with check (public.is_editor());

-- Perfil al registrarse; editor por email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  user_role text;
begin
  user_email := coalesce(new.email, new.raw_user_meta_data ->> 'email');
  user_role := case
    when lower(coalesce(user_email, '')) = lower('rai1903fan@gmail.com') then 'editor'
    else 'user'
  end;

  insert into public.profiles (id, email, display_name, avatar_url, role)
  values (
    new.id,
    user_email,
    coalesce(
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    user_role
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    role = case
      when lower(coalesce(excluded.email, '')) = lower('rai1903fan@gmail.com') then 'editor'
      else profiles.role
    end,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create index if not exists quiniela_predictions_user_season_idx
  on public.quiniela_predictions (user_id, season_id);

create index if not exists cms_news_published_at_idx
  on public.cms_news_items (published_at desc);
