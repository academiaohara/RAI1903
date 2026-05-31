import type { User } from "@supabase/supabase-js";

export function getUserDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const preferred =
    (typeof meta?.preferred_username === "string" && meta.preferred_username) ||
    (typeof meta?.user_name === "string" && meta.user_name) ||
    (typeof meta?.full_name === "string" && meta.full_name) ||
    (typeof meta?.name === "string" && meta.name);

  if (preferred) return preferred.startsWith("@") ? preferred : `@${preferred}`;

  const email = user.email?.split("@")[0];
  if (email) return email;

  return "Usuario";
}

export function getUserAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const url = meta?.avatar_url ?? meta?.picture;
  return typeof url === "string" ? url : null;
}
