-- =============================================================================
-- Valoraciones visibles para todos — ejecutar en Supabase → SQL Editor
-- Si las valoraciones se envían bien pero otras personas no ven la «Media»,
-- la política de lectura estaba limitada a usuarios autenticados.
-- Idempotente: puedes ejecutarlo varias veces.
-- Alternativa: volver a ejecutar supabase/FIX_MATCH_PLAYER_RATINGS.sql
-- =============================================================================

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
