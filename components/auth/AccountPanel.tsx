"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { User } from "@supabase/supabase-js";
import { AccountBoletosSummary } from "@/components/auth/AccountBoletosSummary";
import { DisplayNameForm } from "@/components/auth/DisplayNameForm";
import { SupportedTeamProfileSection } from "@/components/auth/SupportedTeamProfileSection";
import { resolveUserHandle } from "@/lib/auth/profile";
import { getUserAvatarUrl } from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export function AccountDashboard({
  user,
  displayHandle,
  onHandleSaved,
  embedded = false,
}: {
  user: User;
  displayHandle: string;
  onHandleSaved: (handle: string) => void;
  embedded?: boolean;
}) {
  const avatarUrl = getUserAvatarUrl(user);

  return (
    <div className={cn(!embedded && "mx-auto w-full max-w-md")}>
      <section
        className={cn(
          "overflow-hidden",
          embedded ? "rounded-xl border border-[#214C9B]/10 bg-slate-50/50" : "rounded-2xl border border-[#214C9B]/12 bg-white shadow-sm",
        )}
      >
        <div className="grid grid-cols-2 divide-x divide-[#214C9B]/8">
          <SupportedTeamProfileSection user={user} embedded />
          <DisplayNameForm
            key={displayHandle}
            variant="card"
            embedded
            avatarUrl={avatarUrl}
            initialHandle={displayHandle}
            onSaved={onHandleSaved}
          />
        </div>

        <div className="border-t border-[#214C9B]/8 px-3 py-3 sm:px-4">
          <h2 className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
            Tus pronósticos
          </h2>
          <AccountBoletosSummary user={user} compact />
        </div>
      </section>
    </div>
  );
}

export function AccountPanelSkeleton({ embedded = false }: { embedded?: boolean }) {
  return (
    <div
      className={cn(!embedded && "mx-auto w-full max-w-md")}
      aria-busy="true"
      aria-label="Cargando tu cuenta"
    >
      <div
        className={cn(
          "overflow-hidden",
          embedded ? "rounded-xl border border-[#214C9B]/10 bg-slate-50/50" : "rounded-2xl border border-[#214C9B]/12 bg-white shadow-sm",
        )}
      >
        <div className="grid grid-cols-2 divide-x divide-[#214C9B]/8">
          <div className="h-28 animate-pulse bg-[#214C9B]/5" />
          <div className="h-28 animate-pulse bg-[#214C9B]/5" />
        </div>
        <div className="space-y-2 border-t border-[#214C9B]/8 px-3 py-3 sm:px-4">
          <div className="h-3 w-24 animate-pulse rounded bg-[#214C9B]/10" />
          <div className="grid gap-2">
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-12 animate-pulse rounded-xl bg-[#214C9B]/5" />
            ))}
          </div>
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
        router.replace("/login?next=/?cuenta=1" as Route);
      }
    });
  }, [configured, router]);

  if (!configured) {
    return (
      <p className="mx-auto max-w-md rounded-2xl border border-[#981915]/30 bg-[#981915]/10 px-5 py-4 text-sm font-medium text-[#981915]">
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
