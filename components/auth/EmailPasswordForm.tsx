"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  requestPasswordReset,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/auth/email-auth";
import { cn } from "@/lib/utils";

type EmailPasswordFormProps = {
  nextPath?: string;
  className?: string;
};

type FormMode = "login" | "register" | "forgot";

const inputClassName =
  "mt-1 w-full rounded-xl border border-[#214C9B]/20 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/20";

export function EmailPasswordForm({ nextPath = "/", className }: EmailPasswordFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    resetMessages();

    if (mode === "forgot") {
      const result = await requestPasswordReset(email);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess("Te hemos enviado un correo con el enlace para restablecer tu contraseña.");
      setLoading(false);
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (mode === "register") {
      const result = await signUpWithEmail(email, username, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.needsEmailConfirmation) {
        setSuccess("Cuenta creada. Revisa tu correo para confirmarla antes de entrar.");
        setLoading(false);
        return;
      }

      router.replace(next as Route);
      router.refresh();
      return;
    }

    const result = await signInWithEmail(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.replace(next as Route);
    router.refresh();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {mode !== "forgot" ? (
        <div className="grid grid-cols-2 gap-2 rounded-full border border-[#214C9B]/15 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              resetMessages();
            }}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-extrabold uppercase tracking-wide transition",
              mode === "login" ? "bg-[#214C9B] text-white" : "text-[#214C9B] hover:bg-white",
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              resetMessages();
            }}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-extrabold uppercase tracking-wide transition",
              mode === "register" ? "bg-[#214C9B] text-white" : "text-[#214C9B] hover:bg-white",
            )}
          >
            Registrarse
          </button>
        </div>
      ) : (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              resetMessages();
            }}
            className="text-sm font-bold text-[#214C9B] underline-offset-2 hover:underline"
          >
            Volver a entrar
          </button>
        </div>
      )}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block text-left">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Correo electrónico</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="tu@correo.com"
            required
          />
        </label>

        {mode === "register" ? (
          <label className="block text-left">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre de usuario</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClassName}
              placeholder="tu_usuario"
              required
            />
          </label>
        ) : null}

        {mode !== "forgot" ? (
          <label className="block text-left">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Contraseña</span>
            <input
              type="password"
              name="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
              placeholder="••••••••"
              required
            />
          </label>
        ) : null}

        {mode === "register" ? (
          <label className="block text-left">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Repetir contraseña</span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
              placeholder="••••••••"
              required
            />
          </label>
        ) : null}

        {mode === "login" ? (
          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                resetMessages();
              }}
              className="text-xs font-bold text-[#214C9B] underline-offset-2 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        ) : null}

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
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#214C9B] bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[#214C9B] transition hover:bg-[#214C9B]/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Procesando…"
            : mode === "register"
              ? "Crear cuenta"
              : mode === "forgot"
                ? "Enviar enlace"
                : "Entrar"}
        </button>
      </form>
    </div>
  );
}
