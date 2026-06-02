-- Lectura de quinielas guardadas y perfiles para calcular rankings entre usuarios autenticados.

create policy "quiniela_saved_rounds_read_participants"
  on public.quiniela_saved_rounds
  for select
  to authenticated
  using (true);

create policy "quiniela_predictions_read_participants"
  on public.quiniela_predictions
  for select
  to authenticated
  using (true);

create policy "profiles_select_display_for_ranking"
  on public.profiles
  for select
  to authenticated
  using (true);
