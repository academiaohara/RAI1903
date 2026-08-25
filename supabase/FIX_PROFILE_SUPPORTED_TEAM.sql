-- Ejecutar en Supabase → SQL Editor si falta la columna supported_team_id en profiles
alter table public.profiles
  add column if not exists supported_team_id text;

comment on column public.profiles.supported_team_id is
  'ID del equipo del Grupo I que el usuario sigue en la quiniela (p. ej. real-aviles-industrial).';
