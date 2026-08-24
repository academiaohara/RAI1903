-- Allow duplicate public display names; each user remains uniquely identified by profiles.id (auth.users uuid).

drop index if exists public.profiles_display_name_unique_idx;

drop function if exists public.is_display_name_available(text, uuid);
