"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { User } from "@supabase/supabase-js";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { userHasEmailPasswordIdentity } from "@/lib/auth/email-auth";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AccountPanel() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
      if (!data.user) {
        router.replace("/login?next=/cuenta" as Route);
      }
    });
  }, [configured, router]);

  if (!configured) {
    return (
      <p className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-medium text-[#981915]">
        Supabase no está configurado en este entorno.
      </p>
    );
  }

  if (!ready || !user) {
    return <p className="text-center text-sm text-slate-600">Cargando tu cuenta…</p>;
  }

  const canChangePassword = userHasEmailPasswordIdentity(user);
  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const email = user.email ?? "";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-[#214C9B]/15 bg-slate-50 p-4">
        <UserAvatar avatarUrl={avatarUrl} label={displayName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-[#214C9B]">{displayName}</p>
          {email ? <p className="truncate text-sm text-slate-600">{email}</p> : null}
        </div>
      </div>

      {canChangePassword ? (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Cambiar contraseña</h2>
          <ChangePasswordForm email={email} />
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Has entrado con X. Para usar correo y contraseña, regístrate con email o solicita un enlace de recuperación
          desde la pantalla de entrar.
        </p>
      )}

      <p className="text-center text-sm text-slate-600">
        <Link href="/" prefetch={false} className="font-bold text-[#214C9B] underline-offset-2 hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
