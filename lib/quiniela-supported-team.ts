import { RAI_TEAM_ID } from "@/data/mock";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const SUPPORTED_TEAM_STORAGE_KEY = "rai1903.quiniela.supported-team.v1";
export const SUPPORTED_TEAM_MIGRATED_PREFIX = "rai1903.quiniela.supported-team.migrated.";

export const DEFAULT_SUPPORTED_TEAM_ID = RAI_TEAM_ID;

export function loadLocalSupportedTeamId(): string {
  if (typeof window === "undefined") return DEFAULT_SUPPORTED_TEAM_ID;
  try {
    const stored = window.localStorage.getItem(SUPPORTED_TEAM_STORAGE_KEY);
    return stored?.trim() || DEFAULT_SUPPORTED_TEAM_ID;
  } catch {
    return DEFAULT_SUPPORTED_TEAM_ID;
  }
}

export function saveLocalSupportedTeamId(teamId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUPPORTED_TEAM_STORAGE_KEY, teamId);
}

function migrationKey(userId: string): string {
  return `${SUPPORTED_TEAM_MIGRATED_PREFIX}${userId}`;
}

export async function fetchProfileSupportedTeamId(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("supported_team_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchProfileSupportedTeamId", error.message);
    return null;
  }

  const value = (data as { supported_team_id?: string | null } | null)?.supported_team_id;
  return value?.trim() || null;
}

export async function updateProfileSupportedTeamId(
  userId: string,
  teamId: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    saveLocalSupportedTeamId(teamId);
    return { error: null };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ supported_team_id: teamId, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { error: error.message };

  saveLocalSupportedTeamId(teamId);
  return { error: null };
}

export async function loadSupportedTeamId(
  userId: string | null,
  options?: { hasSavedQuiniela?: boolean },
): Promise<string> {
  if (!isSupabaseConfigured()) {
    return loadLocalSupportedTeamId();
  }

  if (!userId) {
    return loadLocalSupportedTeamId();
  }

  const profileTeamId = await fetchProfileSupportedTeamId(userId);
  if (profileTeamId) {
    saveLocalSupportedTeamId(profileTeamId);
    return profileTeamId;
  }

  const hasLocalSaved =
    typeof window !== "undefined" &&
    Object.keys(JSON.parse(window.localStorage.getItem("rai1903.quiniela.saved-rounds.v1") ?? "{}")).length > 0;

  const shouldMigrate = options?.hasSavedQuiniela || hasLocalSaved;

  if (shouldMigrate && typeof window !== "undefined" && !window.localStorage.getItem(migrationKey(userId))) {
    await updateProfileSupportedTeamId(userId, DEFAULT_SUPPORTED_TEAM_ID);
    window.localStorage.setItem(migrationKey(userId), new Date().toISOString());
    return DEFAULT_SUPPORTED_TEAM_ID;
  }

  const local = loadLocalSupportedTeamId();
  return local || DEFAULT_SUPPORTED_TEAM_ID;
}

export async function saveSupportedTeamId(userId: string | null, teamId: string): Promise<void> {
  saveLocalSupportedTeamId(teamId);
  if (userId) {
    await updateProfileSupportedTeamId(userId, teamId);
  }
}
