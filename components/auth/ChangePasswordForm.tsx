"use client";

import { useState } from "react";
import { changePassword } from "@/lib/auth/email-auth";
import { cn } from "@/lib/utils";

type ChangePasswordFormProps = {
  email: string;
  className?: string;
};

const inputClassName =
  "mt-1 w-full rounded-xl border border-[#214C9B]/20 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/20";

export function ChangePasswordForm({ email, className }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      setLoading(false);
      return;
    }

    const result = await changePassword(email, currentPassword, newPassword);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("Contraseña actualizada correctamente.");
    setLoading(false);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className={cn("space-y-4", className)}>
      <label className="block text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Contraseña actual</span>
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={inputClassName}
          required
        />
      </label>

      <label className="block text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Nueva contraseña</span>
        <input
          type="password"
          name="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={inputClassName}
          required
        />
      </label>

      <label className="block text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Repetir nueva contraseña</span>
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
        {loading ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
