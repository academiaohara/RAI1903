"use client";

import { Plus } from "lucide-react";
import type { SquadPosition } from "@/types/squad";
import { SQUAD_POSITIONS, SQUAD_POSITION_LABELS } from "@/types/squad";

type SquadEditToolbarProps = {
  onAddPlayer: (position: SquadPosition) => void;
  busy?: boolean;
};

export function SquadEditToolbar({ onAddPlayer, busy = false }: SquadEditToolbarProps) {
  return (
    <section className="rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">Añadir jugador</p>
      <p className="mt-1 text-sm text-slate-600">
        Edita nombre, dorsal y rol en cada ficha o fila. Lesionado y sancionado se marcan en «Bajas» dentro de la ficha completa.
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
