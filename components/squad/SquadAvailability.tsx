"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerFullName } from "@/lib/squad-utils";
import { InjuryIcon, RedCardIcon } from "@/components/competicion/AvailabilityIcons";

const fieldClass =
  "rounded-lg border border-[#214C9B]/25 bg-white px-2 py-1 text-sm font-semibold text-slate-800 outline-none focus:border-[#214C9B]";

type SquadAvailabilityProps = {
  injured: SquadPlayer[];
  suspended: SquadPlayer[];
  available?: SquadPlayer[];
  onSelect?: (player: SquadPlayer) => void;
  editMode?: boolean;
  onMarkUnavailable?: (playerId: string, estado: "lesionado" | "sancionado") => void;
  onMarkAvailable?: (playerId: string) => void;
};

export function SquadAvailability({
  injured,
  suspended,
  available = [],
  onSelect,
  editMode = false,
  onMarkUnavailable,
  onMarkAvailable,
}: SquadAvailabilityProps) {
  const canEditInline = Boolean(editMode && onMarkUnavailable && onMarkAvailable);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AvailabilityCard
        title="Lesionados"
        players={injured}
        empty={
          canEditInline
            ? "Sin lesionados. Pulsa «Añadir jugador» para marcar una baja."
            : "Sin lesionados registrados."
        }
        icon={<InjuryIcon className="h-5 w-5" />}
        targetEstado="lesionado"
        available={available}
        onSelect={canEditInline ? undefined : onSelect}
        editMode={canEditInline}
        onMarkUnavailable={onMarkUnavailable}
        onMarkAvailable={onMarkAvailable}
      />
      <AvailabilityCard
        title="Sancionados"
        players={suspended}
        empty={
          canEditInline
            ? "Sin sancionados. Pulsa «Añadir jugador» para marcar una baja."
            : "Sin sancionados activos."
        }
        icon={<RedCardIcon className="h-5 w-3.5" />}
        targetEstado="sancionado"
        available={available}
        onSelect={canEditInline ? undefined : onSelect}
        editMode={canEditInline}
        onMarkUnavailable={onMarkUnavailable}
        onMarkAvailable={onMarkAvailable}
      />
    </div>
  );
}

function AvailabilityCard({
  title,
  players,
  empty,
  icon,
  targetEstado,
  available,
  onSelect,
  editMode = false,
  onMarkUnavailable,
  onMarkAvailable,
}: {
  title: string;
  players: SquadPlayer[];
  empty: string;
  icon: ReactNode;
  targetEstado: "lesionado" | "sancionado";
  available: SquadPlayer[];
  onSelect?: (player: SquadPlayer) => void;
  editMode?: boolean;
  onMarkUnavailable?: (playerId: string, estado: "lesionado" | "sancionado") => void;
  onMarkAvailable?: (playerId: string) => void;
}) {
  const usedIds = new Set(players.map((player) => player.id));
  const pickerOptions = available.filter((player) => !usedIds.has(player.id));
  const canAdd = editMode && pickerOptions.length > 0;

  const addPlayer = () => {
    const next = pickerOptions[0];
    if (!next || !onMarkUnavailable) return;
    onMarkUnavailable(next.id, targetEstado);
  };

  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#214C9B]">{icon}</span>
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#214C9B]">{title}</h3>
        </div>
        {editMode && (
          <button
            type="button"
            onClick={addPlayer}
            disabled={!canAdd}
            className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={12} aria-hidden />
            Añadir jugador
          </button>
        )}
      </div>
      <ul className="mt-3 space-y-2">
        {players.length > 0 ? (
          players.map((player) => {
            const otherIds = new Set(
              players.filter((entry) => entry.id !== player.id).map((entry) => entry.id),
            );
            const rowPickerOptions = [
              player,
              ...available.filter((option) => !otherIds.has(option.id)),
            ];

            return (
              <li key={player.id}>
                {editMode ? (
                  <AvailabilityEditRow
                    player={player}
                    targetEstado={targetEstado}
                    pickerOptions={rowPickerOptions}
                    onMarkUnavailable={onMarkUnavailable!}
                    onMarkAvailable={onMarkAvailable!}
                  />
                ) : onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(player)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-[#214C9B]/30 hover:bg-blue-50/50"
                  >
                    <AvailabilityPlayerInfo player={player} />
                  </button>
                ) : (
                  <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <AvailabilityPlayerInfo player={player} />
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <li className="text-sm font-bold text-slate-500">{empty}</li>
        )}
      </ul>
    </div>
  );
}

function AvailabilityEditRow({
  player,
  targetEstado,
  pickerOptions,
  onMarkUnavailable,
  onMarkAvailable,
}: {
  player: SquadPlayer;
  targetEstado: "lesionado" | "sancionado";
  pickerOptions: SquadPlayer[];
  onMarkUnavailable: (playerId: string, estado: "lesionado" | "sancionado") => void;
  onMarkAvailable: (playerId: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#214C9B]/15 bg-slate-50/80 p-2">
      <select
        value={player.id}
        onChange={(event) => {
          const nextId = event.target.value;
          if (!nextId || nextId === player.id) return;
          onMarkAvailable(player.id);
          onMarkUnavailable(nextId, targetEstado);
        }}
        className={`${fieldClass} min-w-0 flex-1`}
        aria-label="Jugador"
      >
        {pickerOptions.map((option) => (
          <option key={option.id} value={option.id}>
            #{option.dorsal} {getPlayerFullName(option)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onMarkAvailable(player.id)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-extrabold uppercase text-[#981915] hover:bg-red-50"
        aria-label="Eliminar jugador"
      >
        <Trash2 size={14} aria-hidden />
        Eliminar
      </button>
    </div>
  );
}

function AvailabilityPlayerInfo({ player }: { player: SquadPlayer }) {
  return (
    <div>
      <p className="font-bold text-slate-800">{getPlayerFullName(player)}</p>
      <p className="text-xs font-semibold text-slate-500">
        #{player.dorsal} · {player.rol}
      </p>
    </div>
  );
}
