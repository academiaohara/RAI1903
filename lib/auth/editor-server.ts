import { EDITOR_EMAIL } from "@/lib/auth/editor";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function isEditorRequest(): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const email = user.email?.toLowerCase();
    if (email === EDITOR_EMAIL.toLowerCase()) return true;

    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return data?.role === "editor";
  } catch {
    return false;
  }
}
