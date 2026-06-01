/**
 * Sube plantilla, calendario y crónicas del repo a Supabase (cms_season_bundles).
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:cms
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:cms -- 2025-26
 */
import { seedSeasonFromRepo } from "../lib/cms/seed-season-from-repo";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

const seasonId = process.argv[2] ?? "2025-26";

async function main() {
  const supabase = createSupabaseAdminClient();
  const result = await seedSeasonFromRepo(supabase, seasonId);

  if (!result.ok) {
    console.error(`Error al subir temporada ${seasonId}:`, result.error);
    process.exit(1);
  }

  console.log(`Temporada ${seasonId} subida a Supabase (fixtures, plantilla, crónicas).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
