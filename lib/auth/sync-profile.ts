import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/auth/user-display";

export async function syncUserProfile(supabase: SupabaseClient, user: User): Promise<void> {
  const avatarUrl = getUserAvatarUrl(user);
  const displayName = getUserDisplayName(user).replace(/^@/, "") || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      display_name: displayName,
      email: user.email ?? null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("syncUserProfile", error.message);
  }
}
