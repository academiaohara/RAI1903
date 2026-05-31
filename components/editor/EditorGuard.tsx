"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { isEditorSession } from "@/lib/auth/editor";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function EditorGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.replace("/");
      return;
    }

    const supabase = createClient();

    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login?next=/editor");
        return;
      }
      const editor = await isEditorSession(user);
      if (!editor) {
        router.replace("/");
        return;
      }
      setAllowed(true);
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return <p className="text-sm font-medium text-slate-600">Comprobando acceso al editor…</p>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
