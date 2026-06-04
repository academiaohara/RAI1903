import type { User } from "@supabase/supabase-js";

export type ProfileDisplayFields = {
  display_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

function handleFromLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "@usuario";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function getProfileHandle(profile: ProfileDisplayFields): string {
  const name = profile.display_name?.trim();
  if (name) return handleFromLabel(name);

  const email = profile.email?.trim();
  if (email) {
    const local = email.split("@")[0]?.trim();
    if (local) return `@${local}`;
  }

  return "@usuario";
}

export function getProfileAvatarUrl(profile: ProfileDisplayFields): string | null {
  const url = profile.avatar_url?.trim();
  return url || null;
}

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
