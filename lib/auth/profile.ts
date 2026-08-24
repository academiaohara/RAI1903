import type { User } from "@supabase/supabase-js";
import { normalizeUsername, validateUsername } from "@/lib/auth/email-auth";
import {
  getProfileHandle,
  getUserDisplayName,
  type ProfileDisplayFields,
} from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const DISPLAY_NAME_TAKEN_ERROR = "Ese nombre ya está en uso. Prueba con otro.";

function isUniqueViolation(error: { code?: string; message?: string }): boolean {
  return error.code === "23505" || error.message?.toLowerCase().includes("profiles_display_name_unique") === true;
}

export async function fetchOwnProfile(userId: string): Promise<ProfileDisplayFields | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, email, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchOwnProfile", error.message);
    return null;
  }

  return data as ProfileDisplayFields | null;
}

export async function resolveUserHandle(user: User): Promise<string> {
  const profile = await fetchOwnProfile(user.id);
  if (profile) return getProfileHandle(profile);
  return getUserDisplayName(user);
}

export async function isDisplayNameAvailable(
  rawName: string,
  excludeUserId?: string,
): Promise<boolean> {
  const normalized = normalizeUsername(rawName.replace(/^@/, ""));
  if (!normalized) return false;

  if (!isSupabaseConfigured()) return true;

  const supabase = createClient();

  const { data, error } = await supabase.rpc("is_display_name_available", {
    display_name: normalized,
    exclude_user_id: excludeUserId ?? null,
  });

  if (!error && typeof data === "boolean") {
    return data;
  }

  if (error) {
    console.error("is_display_name_available rpc", error.message);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return true;
  }

  let query = supabase.from("profiles").select("id").ilike("display_name", normalized).limit(1);
  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data: rows, error: queryError } = await query;
  if (queryError) {
    console.error("isDisplayNameAvailable fallback", queryError.message);
    return false;
  }

  return !rows?.length;
}

export async function updateDisplayName(rawName: string): Promise<{ error: string | null }> {
  const usernameError = validateUsername(rawName.replace(/^@/, ""));
  if (usernameError) return { error: usernameError };

  if (!isSupabaseConfigured()) {
    return { error: "Supabase no está configurado en este entorno." };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Inicia sesión para cambiar tu nombre." };
  }

  const normalized = normalizeUsername(rawName.replace(/^@/, ""));

  const available = await isDisplayNameAvailable(normalized, user.id);
  if (!available) {
    return { error: DISPLAY_NAME_TAKEN_ERROR };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: normalized, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    if (isUniqueViolation(error)) {
      return { error: DISPLAY_NAME_TAKEN_ERROR };
    }
    return { error: error.message };
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      preferred_username: normalized,
      user_name: normalized,
      display_name: normalized,
    },
  });

  if (metaError) {
    console.error("updateDisplayName metadata", metaError.message);
  }

  return { error: null };
}
