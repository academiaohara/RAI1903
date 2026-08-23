"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { updatePasswordAfterRecovery } from "@/lib/auth/email-auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const inputClassName =
  "mt-1 w-full rounded-xl border border-[#214C9B]/20 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/20";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const result = await updatePasswordAfterRecovery(password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess("Contraseña actualizada. Ya puedes entrar con tu nueva contraseña.");
    setLoading(false);
    window.setTimeout(() => {
      router.replace("/login" as Route);
    }, 1500);
  };

  if (!ready) {
    return (
      <p className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-medium text-[#981915]">
        El enlace no es válido o ha caducado. Solicita uno nuevo desde la pantalla de entrar.
      </p>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className={cn("space-y-4")}>
      <label className="block text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Nueva contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
          required
        />
      </label>

      <label className="block text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Repetir contraseña</span>
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputClassName}
          required
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-medium text-[#981915]">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#214C9B] bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#1a3d7a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
