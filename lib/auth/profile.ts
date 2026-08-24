import type { User } from "@supabase/supabase-js";
import { normalizeUsername, validateUsername } from "@/lib/auth/email-auth";
import {
  getProfileHandle,
  getUserDisplayName,
  type ProfileDisplayFields,
} from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: normalized, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
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
