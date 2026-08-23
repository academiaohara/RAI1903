"use client";

import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OAuthLoginButtons } from "@/components/auth/OAuthLoginButtons";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import { getUserAvatarUrl } from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export function AuthHeaderButton({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const nextPath = pathname.startsWith("/login") ? "/quiniela" : pathname;

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();

    const syncUser = (next: User | null) => {
      setUser(next);
      setReady(true);
      if (next) {
        void syncUserProfile(supabase, next);
      }
    };

    void supabase.auth.getUser().then(({ data }) => syncUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const signOut = async () => {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!configured) {
    return null;
  }

  if (!ready) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border border-transparent p-2 opacity-0 sm:min-h-[36px] sm:min-w-[36px]",
          className,
        )}
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <div ref={menuRef} className={cn("relative shrink-0", className)}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Entrar"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/50 p-2 text-white transition hover:border-white hover:bg-white/10 sm:px-3"
        >
          <LogIn size={18} aria-hidden />
          <span className="hidden text-xs font-bold uppercase tracking-wide sm:inline">Entrar</span>
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#214C9B]/20 bg-white p-3 shadow-lg">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Elige cómo entrar
            </p>
            <OAuthLoginButtons
              nextPath={nextPath}
              compact
              googleLabel="Google"
              xLabel="X"
            />
          </div>
        ) : null}
      </div>
    );
  }

  const avatarUrl = getUserAvatarUrl(user);

  return (
    <div ref={menuRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-label="Cuenta"
      >
        <UserAvatar avatarUrl={avatarUrl} label="?" size="md" fallback="header" />
      </button>

      {menuOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-[#214C9B]/20 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              router.push("/cuenta");
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-[#214C9B] hover:bg-slate-50"
          >
            <UserRound size={16} aria-hidden />
            Mi cuenta
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-[#981915] hover:bg-red-50"
          >
            <LogOut size={16} aria-hidden />
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}
