"use client";

import type { SquadPlayer } from "@/types/squad";
import type { PlayerStatus } from "@/types";

const ESTADOS: PlayerStatus[] = [
  "titular",
  "suplente",
  "lesionado",
  "sancionado",
  "cantera",
  "nuevo fichaje",
];

type SquadPlayerQuickEditProps = {
  player: SquadPlayer;
  onUpdate: (patch: Partial<SquadPlayer>) => void;
  layout?: "card" | "row";
};

const fieldClass =
  "rounded-lg border border-[#214C9B]/25 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/15";

export function SquadPlayerQuickEdit({ player, onUpdate, layout = "card" }: SquadPlayerQuickEditProps) {
  const stop = (event: React.SyntheticEvent) => event.stopPropagation();

  if (layout === "row") {
    return (
      <div className="flex flex-wrap items-center gap-2" onClick={stop} onKeyDown={stop}>
        <input
          type="number"
          value={player.dorsal}
          onChange={(event) => onUpdate({ dorsal: Number(event.target.value) || 0 })}
          className={`${fieldClass} w-12 text-center font-extrabold tabular-nums text-[#214C9B]`}
          aria-label="Dorsal"
        />
        <input
          value={player.nombre}
          onChange={(event) => onUpdate({ nombre: event.target.value })}
          placeholder="Nombre"
          className={`${fieldClass} min-w-[5rem] flex-1`}
          aria-label="Nombre"
        />
        <input
          value={player.apellido}
          onChange={(event) => onUpdate({ apellido: event.target.value })}
          placeholder="Apellido"
          className={`${fieldClass} min-w-[5rem] flex-[1.2]`}
          aria-label="Apellido"
        />
        <select
          value={player.estado}
          onChange={(event) => onUpdate({ estado: event.target.value as PlayerStatus })}
          className={`${fieldClass} max-w-[9rem] text-[10px] font-bold uppercase`}
          aria-label="Estado"
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-[#214C9B]/15 bg-white/95 p-2" onClick={stop} onKeyDown={stop}>
      <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-1.5">
        <input
          type="number"
          value={player.dorsal}
          onChange={(event) => onUpdate({ dorsal: Number(event.target.value) || 0 })}
          className={`${fieldClass} text-center font-extrabold tabular-nums text-[#214C9B]`}
          aria-label="Dorsal"
        />
        <input
          value={player.nombre}
          onChange={(event) => onUpdate({ nombre: event.target.value })}
          placeholder="Nombre"
          className={fieldClass}
          aria-label="Nombre"
        />
        <input
          value={player.apellido}
          onChange={(event) => onUpdate({ apellido: event.target.value })}
          placeholder="Apellido"
          className={fieldClass}
          aria-label="Apellido"
        />
      </div>
      <select
        value={player.estado}
        onChange={(event) => onUpdate({ estado: event.target.value as PlayerStatus })}
        className={`${fieldClass} w-full text-[10px] font-bold uppercase`}
        aria-label="Estado"
      >
        {ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>
    </div>
  );
}
