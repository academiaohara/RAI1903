"use client";

import { RFEF_GRUPOS, type RfefGrupoId } from "@/lib/rfef-grupos";
import { cn } from "@/lib/utils";

type JornadasGrupoSwitcherProps = {
  value: RfefGrupoId;
  onChange: (grupo: RfefGrupoId) => void;
  className?: string;
};

export function JornadasGrupoSwitcher({ value, onChange, className }: JornadasGrupoSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-[#214C9B]/15 bg-white p-0.5 shadow-sm sm:rounded-2xl sm:p-1",
        className,
      )}
      role="tablist"
      aria-label="Grupo de resultados"
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
              "rounded-lg px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide transition sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm",
              active
                ? "bg-[#981915] text-white shadow-sm"
                : "text-slate-600 hover:bg-[#214C9B] hover:text-white",
            )}
          >
            {grupo.label}
          </button>
        );
      })}
    </div>
  );
}
