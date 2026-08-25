"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { User } from "@supabase/supabase-js";
import { AccountBoletosSummary } from "@/components/auth/AccountBoletosSummary";
import { DisplayNameForm } from "@/components/auth/DisplayNameForm";
import { SupportedTeamProfileSection } from "@/components/auth/SupportedTeamProfileSection";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { resolveUserHandle } from "@/lib/auth/profile";
import { getUserAvatarUrl } from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function MemberCard({ displayHandle, avatarUrl }: { displayHandle: string; avatarUrl: string | null }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#173a78] text-white shadow-lg sm:rounded-3xl sm:shadow-xl">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(128deg, #122c5a 0%, #173a78 48%, #214c9b 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.055) 0 44px, transparent 44px 92px)",
        }}
      />

      <div className="relative flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <UserAvatar avatarUrl={avatarUrl} label={displayHandle} size="md" fallback="header" className="shadow-md" />
        <h2 className="min-w-0 truncate font-[family-name:var(--font-bebas-neue)] text-3xl leading-none tracking-wide sm:text-4xl">
          {displayHandle}
        </h2>
      </div>
    </section>
  );
}

function AccountDashboard({
  user,
  displayHandle,
  onHandleSaved,
}: {
  user: User;
  displayHandle: string;
  onHandleSaved: (handle: string) => void;
}) {
  const avatarUrl = getUserAvatarUrl(user);

  return (
    <div className="space-y-4 sm:space-y-6">
      <MemberCard displayHandle={displayHandle} avatarUrl={avatarUrl} />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <SupportedTeamProfileSection user={user} />
        <DisplayNameForm
          key={displayHandle}
          variant="card"
          initialHandle={displayHandle}
          onSaved={onHandleSaved}
        />
      </div>

      <section>
        <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-[#214C9B] sm:text-sm">
          Tus pronósticos
        </h2>
        <AccountBoletosSummary user={user} />
      </section>
    </div>
  );
}

export function AccountPanelSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-label="Cargando tu cuenta">
      <div className="h-20 animate-pulse rounded-2xl bg-[#214C9B]/10 sm:h-24" />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="aspect-square animate-pulse rounded-2xl bg-[#214C9B]/10" />
        <div className="aspect-square animate-pulse rounded-2xl bg-[#214C9B]/10" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-[#214C9B]/10" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="aspect-square animate-pulse rounded-2xl bg-[#214C9B]/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AccountPanel() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);
  const [displayHandle, setDisplayHandle] = useState("@usuario");

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      const nextUser = data.user;
      setUser(nextUser);
      if (nextUser) {
        setDisplayHandle(await resolveUserHandle(nextUser));
      }
      setReady(true);
      if (!nextUser) {
        router.replace("/login?next=/cuenta" as Route);
      }
    });
  }, [configured, router]);

  if (!configured) {
    return (
      <p className="rounded-2xl border border-[#981915]/30 bg-[#981915]/10 px-5 py-4 text-sm font-medium text-[#981915]">
        Supabase no está configurado en este entorno.
      </p>
    );
  }

  if (!ready || !user) {
    return <AccountPanelSkeleton />;
  }

  return (
    <AccountDashboard
      user={user}
      displayHandle={displayHandle}
      onHandleSaved={setDisplayHandle}
    />
  );
}
