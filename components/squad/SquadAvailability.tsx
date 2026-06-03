"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerFullName } from "@/lib/squad-utils";
import { InjuryIcon, RedCardIcon } from "@/components/competicion/AvailabilityIcons";

type SquadAvailabilityProps = {
  injured: SquadPlayer[];
  suspended: SquadPlayer[];
  onSelect?: (player: SquadPlayer) => void;
  editMode?: boolean;
};

export function SquadAvailability({
  injured,
  suspended,
  onSelect,
  editMode = false,
}: SquadAvailabilityProps) {
  return (
    <div className="space-y-3">
      {editMode && (
        <p className="flex items-center gap-2 rounded-xl border border-[#214C9B]/20 bg-blue-50/50 px-3 py-2 text-xs font-semibold text-slate-600">
          <Pencil size={14} className="shrink-0 text-[#214C9B]" aria-hidden />
          Abre la ficha del jugador y marca lesionado o sancionado en el panel «Bajas».
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <AvailabilityCard
          title="Lesionados"
          players={injured}
          empty={editMode ? "Sin lesionados. Marca el estado en la ficha del jugador." : "Sin lesionados registrados."}
          icon={<InjuryIcon className="h-5 w-5" />}
          onSelect={onSelect}
          editMode={editMode}
        />
        <AvailabilityCard
          title="Sancionados"
          players={suspended}
          empty={editMode ? "Sin sancionados. Marca el estado en la ficha del jugador." : "Sin sancionados activos."}
          icon={<RedCardIcon className="h-5 w-3.5" />}
          onSelect={onSelect}
          editMode={editMode}
        />
      </div>
    </div>
  );
}

function AvailabilityCard({
  title,
  players,
  empty,
  icon,
  onSelect,
  editMode = false,
}: {
  title: string;
  players: SquadPlayer[];
  empty: string;
  icon: ReactNode;
  onSelect?: (player: SquadPlayer) => void;
  editMode?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
      <div className="flex items-center gap-2">
        <span className="text-[#214C9B]">{icon}</span>
        <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#214C9B]">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {players.length > 0 ? (
          players.map((player) => (
            <li key={player.id}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(player)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-[#214C9B]/30 hover:bg-blue-50/50"
                >
                  <AvailabilityPlayerInfo player={player} editMode={editMode} />
                </button>
              ) : (
                <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <AvailabilityPlayerInfo player={player} />
                </div>
              )}
            </li>
          ))
        ) : (
          <li className="text-sm font-bold text-slate-500">{empty}</li>
        )}
      </ul>
    </div>
  );
}

function AvailabilityPlayerInfo({ player, editMode = false }: { player: SquadPlayer; editMode?: boolean }) {
  return (
    <div>
      <p className="font-bold text-slate-800">{getPlayerFullName(player)}</p>
      <p className="text-xs font-semibold text-slate-500">
        #{player.dorsal} · {player.rol}
        {editMode ? " · Editar ficha" : ""}
      </p>
    </div>
  );
}
