"use client";

import { Plus, X } from "lucide-react";
import { LineupMiniFicha } from "@/components/lineup/LineupMiniFicha";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import { cn } from "@/lib/utils";
import type { FormationId, FormationSlot } from "@/lib/lineup-formations";

type LineupPitchProps = {
  formation: FormationId;
  slots: FormationSlot[];
  assignments: Array<string | null>;
  playersById: Map<string, SquadPlayer>;
  crestUrl?: string | null;
  selectedPlayerId: string | null;
  selectedSlotIndex: number | null;
  onSlotClick: (slotIndex: number) => void;
  exportMode?: boolean;
};

export function LineupPitch({
  formation,
  slots,
  assignments,
  playersById,
  crestUrl,
  selectedPlayerId,
  selectedSlotIndex,
  onSlotClick,
  exportMode = false,
}: LineupPitchProps) {
  return (
    <div className="lineup-pitch-shell">
      <div className={cn("lineup-pitch", exportMode && "lineup-pitch--export")}>
        <div className="lineup-pitch-markings" aria-hidden>
          <span className="lineup-pitch-center-circle" />
          <span className="lineup-pitch-penalty lineup-pitch-penalty--top" />
          <span className="lineup-pitch-penalty lineup-pitch-penalty--bottom" />
        </div>

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
                  <LineupMiniFicha player={player} size="pitch" crestUrl={crestUrl} />
                  {!exportMode ? (
                    <span className="lineup-pitch-slot-remove" aria-hidden>
                      <X className="h-3 w-3" />
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="lineup-pitch-slot-empty" aria-hidden>
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
