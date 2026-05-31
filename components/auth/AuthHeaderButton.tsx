"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut, Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isEditorSession } from "@/lib/auth/editor";
import { signInWithX } from "@/lib/auth/sign-in-with-x";
import { getUserAvatarUrl } from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export function AuthHeaderButton({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const [ready, setReady] = useState(!configured);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();

    const syncUser = async (next: User | null) => {
      setUser(next);
      setIsEditor(next ? await isEditorSession(next) : false);
      setReady(true);
    };

    void supabase.auth.getUser().then(({ data }) => void syncUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
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

  const handleSignIn = useCallback(async () => {
    setSigningIn(true);
    const next = pathname.startsWith("/login") ? "/quiniela" : pathname;
    const { error } = await signInWithX(next);
    if (error) {
      router.push(`/login?error=auth&reason=${encodeURIComponent(error)}`);
      setSigningIn(false);
    }
  }, [pathname, router]);

  const signOut = async () => {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!configured || !ready) {
    return null;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => void handleSignIn()}
        disabled={signingIn}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/50 p-2 text-white transition hover:border-white hover:bg-white/10 sm:px-3",
          className,
        )}
        aria-label="Entrar con X"
      >
        <LogIn size={18} aria-hidden />
        <span className="hidden text-xs font-bold uppercase tracking-wide sm:inline">
          {signingIn ? "…" : "Entrar"}
        </span>
      </button>
    );
  }

  const avatarUrl = getUserAvatarUrl(user);

  return (
    <div ref={menuRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-full border-2 border-white/60 p-0.5 transition hover:border-white"
        aria-expanded={menuOpen}
        aria-label="Cuenta"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold uppercase">
            ?
          </span>
        )}
      </button>

      {menuOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-[#214C9B]/20 bg-white py-1 shadow-lg">
          {isEditor ? (
            <Link
              href="/editor"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#214C9B] hover:bg-blue-50"
              onClick={() => setMenuOpen(false)}
            >
              <Pencil size={16} aria-hidden />
              Editor
            </Link>
          ) : null}
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
