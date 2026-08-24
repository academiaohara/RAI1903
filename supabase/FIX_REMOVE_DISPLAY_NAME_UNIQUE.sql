-- =============================================================================
-- Permitir nombres públicos repetidos — ejecutar en Supabase → SQL Editor
-- Cada usuario sigue identificado por profiles.id (uuid de auth.users).
-- Idempotente: puedes ejecutarlo varias veces.
-- =============================================================================

drop index if exists public.profiles_display_name_unique_idx;

drop function if exists public.is_display_name_available(text, uuid);
