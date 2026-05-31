"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export function AuthHeaderButton({ className }: { className?: string }) {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setReady(true);
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  if (!configured || !ready) {
    return null;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10 sm:px-4 sm:text-sm",
          className,
        )}
      >
        <LogIn size={16} aria-hidden />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );
  }

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <div className="hidden max-w-[9rem] items-center gap-2 sm:flex">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border-2 border-white/60 object-cover"
            unoptimized
          />
        ) : null}
        <span className="truncate text-xs font-bold uppercase text-white/90">{displayName}</span>
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        className="inline-flex items-center gap-1 rounded-full border border-white/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10 sm:text-sm"
        aria-label="Cerrar sesión"
      >
        <LogOut size={16} aria-hidden />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
