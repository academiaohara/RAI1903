-- Goleador de quiniela por player.id estable (independiente del dorsal).
alter table public.quiniela_predictions
  add column if not exists scorer_id text;
