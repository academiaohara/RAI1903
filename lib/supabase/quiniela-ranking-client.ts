import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Cliente con lectura de todas las quinielas (service role) o sesión autenticada. */
export async function createQuinielaRankingClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado");
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createSupabaseAdminClient();
  }

  return createClient();
}
