-- =============================================================================
-- Sincronizar avatar de X/OAuth al volver a iniciar sesión
-- Sin este trigger, solo se copia avatar_url al registrarse; si cambian la foto
-- en X, profiles.avatar_url puede quedar con una URL antigua (404).
-- Idempotente. Alternativa: volver a ejecutar APPLY_CMS_MIGRATIONS.sql.
-- =============================================================================

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function public.handle_new_user();
