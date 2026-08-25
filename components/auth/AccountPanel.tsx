"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { User } from "@supabase/supabase-js";
import {
  AtSign,
  Gamepad2,
  KeyRound,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { AccountBoletosSummary } from "@/components/auth/AccountBoletosSummary";
import { DisplayNameForm } from "@/components/auth/DisplayNameForm";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { userHasEmailPasswordIdentity } from "@/lib/auth/email-auth";
import { resolveUserHandle } from "@/lib/auth/profile";
import { getUserAvatarUrl } from "@/lib/auth/user-display";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  twitter: "X",
  email: "Correo",
};

function resolveProviders(user: User): string[] {
  const providers = new Set<string>();
  for (const identity of user.identities ?? []) {
    if (identity.provider) providers.add(identity.provider);
  }
  if (providers.size === 0) {
    const appProviders = (user.app_metadata as { providers?: unknown } | undefined)?.providers;
    if (Array.isArray(appProviders)) {
      for (const provider of appProviders) {
        if (typeof provider === "string") providers.add(provider);
      }
    }
  }
  return [...providers].map((provider) => PROVIDER_LABELS[provider] ?? provider);
}

function SettingsCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-[#214C9B]/10 px-4 py-3 sm:px-5 sm:py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-[#214C9B] sm:h-10 sm:w-10">
          <Icon size={18} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">{title}</h2>
          <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

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
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const canChangePassword = userHasEmailPasswordIdentity(user);
  const providers = resolveProviders(user);
  const oauthOnlyProvider = providers.find((provider) => provider !== "Correo") ?? providers[0];
  const avatarUrl = getUserAvatarUrl(user);

  const signOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/" as Route);
    router.refresh();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <MemberCard displayHandle={displayHandle} avatarUrl={avatarUrl} />

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
        <SettingsCard icon={Gamepad2} title="Tus pronósticos" subtitle="Tu posición y puntos en cada juego">
          <AccountBoletosSummary user={user} />
        </SettingsCard>

        <div className="space-y-4 sm:space-y-6">
          <SettingsCard icon={AtSign} title="Nombre público" subtitle="El que se ve en boletos y rankings">
            <DisplayNameForm
              key={displayHandle}
              initialHandle={displayHandle}
              onSaved={onHandleSaved}
            />
          </SettingsCard>

          {canChangePassword ? (
            <SettingsCard icon={KeyRound} title="Seguridad" subtitle="Actualiza tu contraseña de acceso">
              <ChangePasswordForm email={user.email ?? ""} />
            </SettingsCard>
          ) : (
            <SettingsCard icon={ShieldCheck} title="Seguridad" subtitle="Acceso con proveedor externo">
              <p className="text-sm leading-6 text-slate-600">
                Entras con <span className="font-bold text-[#214C9B]">{oauthOnlyProvider}</span>, así que no hace
                falta contraseña aquí: tu acceso y su seguridad se gestionan desde tu cuenta de{" "}
                {oauthOnlyProvider}.
              </p>
            </SettingsCard>
          )}

          <button
            type="button"
            onClick={() => void signOut()}
            disabled={signingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#214C9B]/15 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[#214C9B] transition hover:bg-[#214C9B]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={15} aria-hidden />
            {signingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AccountPanelSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-label="Cargando tu cuenta">
      <div className="h-20 animate-pulse rounded-2xl bg-[#214C9B]/10 sm:h-24" />
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
        <div className="h-56 animate-pulse rounded-2xl bg-[#214C9B]/10 sm:h-64" />
        <div className="space-y-4 sm:space-y-6">
          <div className="h-48 animate-pulse rounded-2xl bg-[#214C9B]/10 sm:h-52" />
          <div className="h-56 animate-pulse rounded-2xl bg-[#214C9B]/10 sm:h-64" />
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
