import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireEnv } from "./env.ts";

let client: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!client) {
    client = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function logSync(
  jobName: string,
  status: "started" | "success" | "error",
  message?: string,
  meta: Record<string, unknown> = {},
  logId?: number,
): Promise<number> {
  const supabase = getAdminClient();

  if (status === "started") {
    const { data, error } = await supabase
      .from("sync_logs")
      .insert({ job_name: jobName, status, message, meta })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as number;
  }

  if (!logId) throw new Error("logId required for success/error");

  const { error } = await supabase
    .from("sync_logs")
    .update({
      status,
      message,
      meta,
      finished_at: new Date().toISOString(),
    })
    .eq("id", logId);

  if (error) throw error;
  return logId;
}

export async function setSyncConfig(key: string, value: string): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from("football_sync_config").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getSyncConfig(key: string): Promise<string | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase.from("football_sync_config").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}
