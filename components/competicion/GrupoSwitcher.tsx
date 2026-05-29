"use client";

import { RFEF_GRUPOS, type RfefGrupoId } from "@/lib/rfef-grupos";
import { cn } from "@/lib/utils";

type GrupoSwitcherProps = {
  value: RfefGrupoId;
  onChange: (grupo: RfefGrupoId) => void;
  className?: string;
};

export function GrupoSwitcher({ value, onChange, className }: GrupoSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-2xl border border-[#214C9B]/20 bg-white p-1 shadow-sm",
        className,
      )}
      role="tablist"
      aria-label="Grupo de Primera Federacion"
    >
      {RFEF_GRUPOS.map((grupo) => {
        const active = value === grupo.id;
        return (
          <button
            key={grupo.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(grupo.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-extrabold uppercase tracking-wide transition",
              active
                ? "bg-[#214C9B] text-white shadow-sm"
                : "text-slate-600 hover:bg-blue-50 hover:text-[#214C9B]",
            )}
          >
            {grupo.label}
          </button>
        );
      })}
    </div>
  );
}
