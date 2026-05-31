import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/** Cuenta con acceso al panel /editor */
export const EDITOR_EMAIL = "rai1903fan@gmail.com";

export function isEditorEmail(email: string | undefined | null): boolean {
  return email?.toLowerCase() === EDITOR_EMAIL.toLowerCase();
}

export function isEditorUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isEditorEmail(user.email)) return true;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const metaEmail = typeof meta?.email === "string" ? meta.email : undefined;
  return isEditorEmail(metaEmail);
}

export async function fetchProfileRole(userId: string): Promise<"editor" | "user" | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return data.role === "editor" ? "editor" : "user";
}

export async function isEditorSession(user: User | null | undefined): Promise<boolean> {
  if (!user) return false;
  if (isEditorUser(user)) return true;
  const role = await fetchProfileRole(user.id);
  return role === "editor";
}
