"use client";

import { Plus } from "lucide-react";
import type { SquadPosition } from "@/types/squad";
import { SQUAD_POSITIONS, SQUAD_POSITION_LABELS } from "@/types/squad";

type SquadEditToolbarProps = {
  onAddPlayer: (position: SquadPosition) => void;
  busy?: boolean;
  variant?: "default" | "femenino";
};

export function SquadEditToolbar({ onAddPlayer, busy = false, variant = "default" }: SquadEditToolbarProps) {
  const isFemenino = variant === "femenino";

  return (
    <section className="rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">Añadir jugador</p>
      <p className="mt-1 text-sm text-slate-600">
        {isFemenino
          ? "Edita dorsal, nombre, posición y estadísticas en la tabla. Lesionados y sancionados se gestionan en los bloques de bajas de arriba."
          : "Edita nombre, dorsal y rol en cada ficha o fila. Lesionados y sancionados se gestionan en los bloques de bajas de arriba."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SQUAD_POSITIONS.map((position) => (
          <button
            key={position}
            type="button"
            disabled={busy}
            onClick={() => onAddPlayer(position)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#214C9B]/25 bg-white px-3 py-2 text-[11px] font-extrabold uppercase text-[#214C9B] transition hover:bg-blue-50 disabled:opacity-60"
          >
            <Plus size={14} aria-hidden />
            {SQUAD_POSITION_LABELS[position]}
          </button>
        ))}
      </div>
    </section>
  );
}
