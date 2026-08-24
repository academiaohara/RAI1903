"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** `undefined` = loading, `null` = not signed in, string = user id */
export function useCurrentUserId(): string | null | undefined {
  const configured = isSupabaseConfigured();
  const [userId, setUserId] = useState<string | null | undefined>(configured ? undefined : null);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();

    const sync = (id: string | null) => setUserId(id);

    void supabase.auth.getUser().then(({ data }) => sync(data.user?.id ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  return userId;
}
