"use client";

import { useMemo } from "react";
import { resolveSquadPlayerByName } from "@/lib/squad-player-resolve";
import type { MatchSquadOption } from "@/lib/match-availability-squad";
import type { SquadPlayer } from "@/types/squad";

const fieldClass =
  "rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#214C9B]";

export function MatchSquadPlayerSelect({
  options,
  value,
  onChange,
  squadForResolve,
  placeholder = "Elegir jugador…",
  allowEmpty = false,
  className,
  "aria-label": ariaLabel,
}: {
  options: MatchSquadOption[];
  value: string;
  onChange: (displayName: string) => void;
  squadForResolve?: SquadPlayer[];
  placeholder?: string;
  /** Muestra opción vacía aunque ya haya jugador elegido (p. ej. asistencia opcional). */
  allowEmpty?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const selectedId = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const byName = options.find((option) => option.name === trimmed);
    if (byName) return byName.playerId;

    if (squadForResolve?.length) {
      const resolved = resolveSquadPlayerByName(squadForResolve, trimmed);
      if (resolved) {
        const match = options.find((option) => option.playerId === resolved.id);
        if (match) return match.playerId;
      }
    }

    return "";
  }, [options, squadForResolve, value]);

  const unmatchedLabel = value.trim() && !selectedId ? value.trim() : null;

  return (
    <select
      value={selectedId}
      onChange={(event) => {
        if (!event.target.value) {
          onChange("");
          return;
        }
        const option = options.find((item) => item.playerId === event.target.value);
        if (option) onChange(option.name);
      }}
      className={className ?? fieldClass}
      aria-label={ariaLabel}
    >
      {(!selectedId || allowEmpty) && <option value="">{placeholder}</option>}
      {unmatchedLabel && (
        <option value="" disabled>
          {unmatchedLabel} (elige de la plantilla)
        </option>
      )}
      {options.map((option) => (
        <option key={option.playerId} value={option.playerId}>
          #{option.dorsal} {option.name}
        </option>
      ))}
    </select>
  );
}
