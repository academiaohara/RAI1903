-- Unique public display names (@handle) for rankings and game tickets.

create or replace function public.is_display_name_available(
  display_name text,
  exclude_user_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles p
    where lower(trim(p.display_name)) = lower(trim(display_name))
      and trim(display_name) <> ''
      and (exclude_user_id is null or p.id <> exclude_user_id)
  );
$$;

revoke all on function public.is_display_name_available(text, uuid) from public;
grant execute on function public.is_display_name_available(text, uuid) to anon, authenticated;

create unique index if not exists profiles_display_name_unique_idx
  on public.profiles (lower(trim(display_name)))
  where display_name is not null and trim(display_name) <> '';
