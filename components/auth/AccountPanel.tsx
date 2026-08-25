"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { User } from "@supabase/supabase-js";
import {
  AtSign,
  CalendarDays,
  Gamepad2,
  KeyRound,
  LogOut,
  Mail,
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
import { formatDate } from "@/lib/utils";

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

function GoogleMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ProviderChip({ provider }: { provider: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
      {provider === "Google" ? <GoogleMark /> : provider === "X" ? <XMark /> : <Mail size={11} aria-hidden />}
      {provider}
    </span>
  );
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
      <header className="flex items-center gap-3 border-b border-[#214C9B]/10 px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-[#214C9B]">
          <Icon size={18} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MemberCard({
  user,
  displayHandle,
}: {
  user: User;
  displayHandle: string;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const avatarUrl = getUserAvatarUrl(user);
  const email = user.email ?? "";
  const providers = resolveProviders(user);
  const memberSince = user.created_at ? formatDate(user.created_at) : null;

  const signOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/" as Route);
    router.refresh();
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#173a78] text-white shadow-xl">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(128deg, #122c5a 0%, #173a78 48%, #214c9b 100%)",
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
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 88% 12%, rgba(255,255,255,0.16), transparent 52%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-10 h-56 w-56 select-none opacity-[0.14] sm:h-64 sm:w-64"
      />

      <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-8">
        <UserAvatar
          avatarUrl={avatarUrl}
          label={displayHandle}
          size="lg"
          fallback="header"
          className="shadow-lg"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">
            Carnet blanquiazul
          </p>
          <h2 className="mt-1 truncate font-[family-name:var(--font-bebas-neue)] text-5xl leading-none tracking-wide sm:text-6xl">
            {displayHandle}
          </h2>
          {email ? (
            <p className="mt-2 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white/85">
              <Mail size={14} aria-hidden className="shrink-0" />
              <span className="truncate">{email}</span>
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {providers.map((provider) => (
              <ProviderChip key={provider} provider={provider} />
            ))}
            {memberSince ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                <CalendarDays size={11} aria-hidden />
                Socio desde {memberSince}
              </span>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 lg:self-start">
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={signingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <LogOut size={15} aria-hidden />
            {signingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      </div>

      <div className="relative border-t border-white/15 bg-[#981915] px-6 py-2.5 sm:px-8">
        <p className="overflow-hidden whitespace-nowrap font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-[0.3em] text-white/85">
          Real Avilés Industrial · 1903 · RAI · Real Avilés Industrial · 1903 · RAI
        </p>
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
  const canChangePassword = userHasEmailPasswordIdentity(user);
  const providers = resolveProviders(user);
  const oauthOnlyProvider = providers.find((provider) => provider !== "Correo") ?? providers[0];

  return (
    <div className="space-y-6">
      <MemberCard user={user} displayHandle={displayHandle} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
        <SettingsCard
          icon={Gamepad2}
          title="Tus boletos"
          subtitle="Lo que llevas guardado en cada juego"
        >
          <AccountBoletosSummary user={user} />
        </SettingsCard>

        <div className="space-y-6">
          <SettingsCard
            icon={AtSign}
            title="Nombre público"
            subtitle="El que se ve en boletos y rankings"
          >
            <DisplayNameForm
              key={displayHandle}
              initialHandle={displayHandle}
              onSaved={onHandleSaved}
            />
          </SettingsCard>

          {canChangePassword ? (
            <SettingsCard
              icon={KeyRound}
              title="Seguridad"
              subtitle="Actualiza tu contraseña de acceso"
            >
              <ChangePasswordForm email={user.email ?? ""} />
            </SettingsCard>
          ) : (
            <SettingsCard
              icon={ShieldCheck}
              title="Seguridad"
              subtitle="Acceso con proveedor externo"
            >
              <p className="text-sm leading-6 text-slate-600">
                Entras con <span className="font-bold text-[#214C9B]">{oauthOnlyProvider}</span>, así que no
                hace falta contraseña aquí: tu acceso y su seguridad se gestionan desde tu
                cuenta de {oauthOnlyProvider}.
              </p>
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountPanelSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando tu cuenta">
      <div className="h-64 animate-pulse rounded-3xl bg-[#214C9B]/10 sm:h-56" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
        <div className="h-80 animate-pulse rounded-2xl bg-[#214C9B]/10" />
        <div className="space-y-6">
          <div className="h-60 animate-pulse rounded-2xl bg-[#214C9B]/10" />
          <div className="h-80 animate-pulse rounded-2xl bg-[#214C9B]/10" />
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
