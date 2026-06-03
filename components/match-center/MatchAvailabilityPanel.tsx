"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import { useMatchTeamSquadOptions } from "@/hooks/useMatchTeamSquadOptions";
import { availabilityPlayerKey, type MatchSquadOption } from "@/lib/match-availability-squad";
import type { MatchAvailability, MatchAvailabilityPlayer, PrimerEquipoGender } from "@/types";

const REASONS: MatchAvailabilityPlayer["reason"][] = ["lesionado", "sancionado"];

const fieldClass =
  "rounded-lg border border-[#214C9B]/25 bg-white px-2 py-1 text-sm font-semibold text-slate-800 outline-none focus:border-[#214C9B]";

function formatReason(reason: MatchAvailabilityPlayer["reason"]): string {
  return reason === "lesionado" ? "Lesionado" : "Sancionado";
}

function AvailabilityPlayerRow({
  entry,
  editMode,
  squadOptions,
  usedPlayerIds,
  onUpdate,
  onRemove,
}: {
  entry: MatchAvailabilityPlayer;
  editMode: boolean;
  squadOptions: MatchSquadOption[];
  usedPlayerIds: Set<string>;
  onUpdate: (patch: Partial<MatchAvailabilityPlayer>) => void;
  onRemove: () => void;
}) {
  const detailText = entry.detail?.trim() ?? "";

  if (!editMode) {
    return (
      <li className="text-sm">
        <span className="font-bold text-slate-800">{entry.name}</span>{" "}
        <span className="text-xs font-bold uppercase text-[#981915]">({entry.reason})</span>
        {detailText ? <p className="text-xs text-slate-500">{detailText}</p> : null}
      </li>
    );
  }

  const selectedId = entry.playerId ?? "";
  const selectableOptions = squadOptions.filter(
    (option) => option.playerId === selectedId || !usedPlayerIds.has(option.playerId),
  );

  return (
    <li className="space-y-2 rounded-xl border border-[#214C9B]/15 bg-slate-50/80 p-3">
      <div className="flex flex-wrap items-start gap-2">
        <select
          value={selectedId}
          onChange={(event) => {
            const option = squadOptions.find((item) => item.playerId === event.target.value);
            if (!option) return;
            onUpdate({ playerId: option.playerId, name: option.name });
          }}
          className={`${fieldClass} min-w-0 flex-1`}
          aria-label="Jugador"
        >
          {!selectedId && <option value="">Elegir jugador…</option>}
          {selectableOptions.map((option) => (
            <option key={option.playerId} value={option.playerId}>
              #{option.dorsal} {option.name}
            </option>
          ))}
        </select>
        <select
          value={entry.reason}
          onChange={(event) => onUpdate({ reason: event.target.value as MatchAvailabilityPlayer["reason"] })}
          className={`${fieldClass} shrink-0 text-xs font-bold uppercase`}
          aria-label="Motivo"
        >
          {REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {formatReason(reason)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#981915] hover:bg-red-50"
          aria-label="Quitar jugador"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <input
        value={entry.detail ?? ""}
        onChange={(event) => onUpdate({ detail: event.target.value })}
        placeholder="Información adicional (opcional)"
        className={`${fieldClass} w-full text-xs font-medium text-slate-600`}
        aria-label="Información adicional"
      />
    </li>
  );
}

function AvailabilityColumn({
  label,
  players,
  editMode,
  squadOptions,
  onChange,
}: {
  label: string;
  players: MatchAvailabilityPlayer[];
  editMode: boolean;
  squadOptions: MatchSquadOption[];
  onChange: (players: MatchAvailabilityPlayer[]) => void;
}) {
  const usedKeys = new Set(players.map(availabilityPlayerKey));
  const canAdd = editMode && squadOptions.some((option) => !usedKeys.has(option.playerId));

  const addPlayer = () => {
    const next = squadOptions.find((option) => !usedKeys.has(option.playerId));
    if (!next) return;
    onChange([
      ...players,
      { playerId: next.playerId, name: next.name, reason: "lesionado", detail: "" },
    ]);
  };

  const updateAt = (index: number, patch: Partial<MatchAvailabilityPlayer>) => {
    onChange(players.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeAt = (index: number) => {
    onChange(players.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-extrabold uppercase text-[#214C9B]">{label}</h4>
        {editMode && (
          <button
            type="button"
            onClick={addPlayer}
            disabled={!canAdd}
            className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={12} aria-hidden />
            Añadir
          </button>
        )}
      </div>
      {players.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          {editMode ? "Sin bajas. Pulsa «Añadir» para incluir un jugador de la plantilla." : "Sin bajas confirmadas."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {players.map((player, index) => {
            const usedPlayerIds = new Set(
              players
                .filter((_, rowIndex) => rowIndex !== index)
                .map((row) => row.playerId)
                .filter((id): id is string => Boolean(id)),
            );
            return (
              <AvailabilityPlayerRow
                key={`${availabilityPlayerKey(player)}-${index}`}
                entry={player}
                editMode={editMode}
                squadOptions={squadOptions}
                usedPlayerIds={usedPlayerIds}
                onUpdate={(patch) => updateAt(index, patch)}
                onRemove={() => removeAt(index)}
              />
            );
          })}
        </ul>
      )}
      {editMode && squadOptions.length === 0 && (
        <p className="mt-2 text-xs font-semibold text-amber-800">
          No hay plantilla cargada para este equipo en la temporada actual.
        </p>
      )}
    </div>
  );
}

export function MatchAvailabilityPanel({
  matchId,
  gender,
  homeTeamId,
  awayTeamId,
  availability,
  homeLabel,
  awayLabel,
}: {
  matchId: string;
  gender: PrimerEquipoGender;
  homeTeamId: string;
  awayTeamId: string;
  availability: MatchAvailability;
  homeLabel: string;
  awayLabel: string;
}) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const keys = useMatchDetailStorageKeys(matchId);
  const current = getValue(keys.availability, availability);
  const { getOptions } = useMatchTeamSquadOptions(gender);

  const homeSquadOptions = useMemo(() => getOptions(homeTeamId), [getOptions, homeTeamId]);
  const awaySquadOptions = useMemo(() => getOptions(awayTeamId), [getOptions, awayTeamId]);

  const saveAvailability = (next: MatchAvailability) => saveValue(keys.availability, next);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold uppercase tracking-normal text-[#214C9B]">Sancionados y lesionados</h3>
      {editMode && (
        <p className="text-xs font-semibold text-slate-600">
          Solo puedes elegir jugadores de la plantilla de cada equipo. La información adicional es opcional.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <AvailabilityColumn
          label={homeLabel}
          players={current.home}
          editMode={editMode}
          squadOptions={homeSquadOptions}
          onChange={(home) => saveAvailability({ ...current, home })}
        />
        <AvailabilityColumn
          label={awayLabel}
          players={current.away}
          editMode={editMode}
          squadOptions={awaySquadOptions}
          onChange={(away) => saveAvailability({ ...current, away })}
        />
      </div>
    </div>
  );
}
