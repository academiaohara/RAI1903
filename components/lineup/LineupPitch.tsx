"use client";

import Image from "next/image";
import { Plus, X } from "lucide-react";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerDisplayName, getNationalityFlagUrl } from "@/lib/squad-utils";
import { cn } from "@/lib/utils";
import type { FormationId, FormationSlot } from "@/lib/lineup-formations";

type LineupPitchProps = {
  formation: FormationId;
  slots: FormationSlot[];
  assignments: Array<string | null>;
  playersById: Map<string, SquadPlayer>;
  selectedPlayerId: string | null;
  selectedSlotIndex: number | null;
  onSlotClick: (slotIndex: number) => void;
  exportMode?: boolean;
};

function PitchPlayerToken({
  player,
  exportMode = false,
}: {
  player: SquadPlayer;
  exportMode?: boolean;
}) {
  const displayName = getPlayerDisplayName(player);
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="lineup-pitch-player">
      <div className="lineup-pitch-player-photo">
        {player.foto ? (
          <Image
            src={player.foto}
            alt={displayName}
            width={80}
            height={96}
            className="h-full w-full object-cover object-top"
            unoptimized={player.foto.startsWith("http")}
          />
        ) : (
          <span className="text-xs font-extrabold text-[#214C9B]/70">{initials}</span>
        )}
      </div>
      {!exportMode ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="lineup-pitch-player-flag"
          src={getNationalityFlagUrl(player.nacionalidad)}
          alt={player.nacionalidad}
          width={14}
          height={10}
        />
      ) : null}
      <p className="lineup-pitch-player-name">{player.apellido || player.nombre}</p>
      <span className="lineup-pitch-player-dorsal">{player.dorsal}</span>
    </div>
  );
}

export function LineupPitch({
  formation,
  slots,
  assignments,
  playersById,
  selectedPlayerId,
  selectedSlotIndex,
  onSlotClick,
  exportMode = false,
}: LineupPitchProps) {
  return (
    <div className="lineup-pitch-shell">
      <div className={cn("lineup-pitch", exportMode && "lineup-pitch--export")}>
        {slots.map((slot, index) => {
          const playerId = assignments[index];
          const player = playerId ? playersById.get(playerId) : undefined;
          const isSelected = selectedSlotIndex === index;
          const canDrop = Boolean(selectedPlayerId) && !player;

          return (
            <button
              key={`${formation}-${index}`}
              type="button"
              onClick={exportMode ? undefined : () => onSlotClick(index)}
              disabled={exportMode}
              className={cn(
                "lineup-pitch-slot",
                player && "lineup-pitch-slot--filled",
                isSelected && "lineup-pitch-slot--selected",
                canDrop && "lineup-pitch-slot--droppable",
              )}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              aria-label={
                player
                  ? `${getPlayerDisplayName(player)}, quitar del once`
                  : `Posición ${index + 1}, colocar jugador`
              }
            >
              {player ? (
                <>
                  <PitchPlayerToken player={player} exportMode={exportMode} />
                  {!exportMode ? (
                    <span className="lineup-pitch-slot-remove" aria-hidden>
                      <X className="h-3 w-3" />
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="lineup-pitch-slot-empty" aria-hidden>
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
