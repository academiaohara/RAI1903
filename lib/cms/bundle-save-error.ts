/** Mensaje legible cuando Supabase rechaza un bundle_key (CHECK desactualizado). */
export function formatSeasonBundleSaveError(message: string): string {
  if (message.includes("cms_season_bundles_bundle_key_check")) {
    if (message.includes("transfers")) {
      return (
        "Supabase no permite guardar el mercado de fichajes (bundle «transfers»). " +
        "Ejecuta supabase/FIX_TRANSFERS_BUNDLE.sql en el SQL Editor de Supabase y vuelve a guardar."
      );
    }
    return (
      "Supabase rechazó el tipo de bundle (constraint desactualizado). " +
      "Vuelve a ejecutar supabase/APPLY_CMS_MIGRATIONS.sql o supabase/FIX_TRANSFERS_BUNDLE.sql en el SQL Editor."
    );
  }
  return message;
}
