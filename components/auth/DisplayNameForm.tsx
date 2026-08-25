"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/Modal";
import { updateDisplayName } from "@/lib/auth/profile";
import { cn } from "@/lib/utils";

type DisplayNameFormProps = {
  initialHandle: string;
  onSaved?: (handle: string) => void;
  className?: string;
  compact?: boolean;
  variant?: "form" | "card";
};

const inputClassName =
  "mt-1 w-full rounded-xl border border-[#214C9B]/20 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/20";

function DisplayNameEditor({
  initialHandle,
  onSaved,
  compact = false,
  onDone,
}: {
  initialHandle: string;
  onSaved?: (handle: string) => void;
  compact?: boolean;
  onDone?: () => void;
}) {
  const [value, setValue] = useState(initialHandle.replace(/^@/, ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateDisplayName(value);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const handle = `@${value.trim().toLowerCase()}`;
    setSuccess("Nombre actualizado.");
    onSaved?.(handle);
    setLoading(false);
    onDone?.();
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <label className="block text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Nombre en rankings y boletos
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-extrabold text-[#214C9B]">@</span>
          <input
            type="text"
            name="displayName"
            autoComplete="username"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={cn(inputClassName, "mt-0")}
            placeholder="tu_nombre"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]{3,24}"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Entre 3 y 24 caracteres: letras, números o guion bajo.
        </p>
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
        className={cn(
          "inline-flex items-center justify-center rounded-full border-2 border-[#214C9B] bg-[#214C9B] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#1a3d7a] disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "w-full px-4 py-2 text-xs" : "w-full px-6 py-3 text-sm",
        )}
      >
        {loading ? "Guardando…" : "Guardar nombre"}
      </button>
    </form>
  );
}

export function DisplayNameForm({
  initialHandle,
  onSaved,
  className,
  compact = false,
  variant = "form",
}: DisplayNameFormProps) {
  const [editing, setEditing] = useState(false);

  if (variant === "card") {
    return (
      <>
        <div
          className={cn(
            "flex aspect-square flex-col overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white shadow-sm",
            className,
          )}
        >
          <header className="flex items-center justify-between gap-2 px-4 py-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#214C9B]">Tu nombre</h2>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#214C9B]/15 text-[#214C9B] transition hover:border-[#214C9B]/35 hover:bg-[#214C9B]/5"
              aria-label="Editar nombre"
            >
              <Pencil size={14} aria-hidden />
            </button>
          </header>

          <div className="flex flex-1 items-center justify-center px-4 pb-5">
            <p className="text-center font-[family-name:var(--font-bebas-neue)] text-3xl leading-none tracking-wide text-[#214C9B] sm:text-4xl">
              {initialHandle}
            </p>
          </div>
        </div>

        <Modal open={editing} title="Editar nombre público" onClose={() => setEditing(false)}>
          <DisplayNameEditor
            key={initialHandle}
            initialHandle={initialHandle}
            onSaved={onSaved}
            compact
            onDone={() => setEditing(false)}
          />
        </Modal>
      </>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <DisplayNameEditor initialHandle={initialHandle} onSaved={onSaved} compact={compact} />
    </div>
  );
}
