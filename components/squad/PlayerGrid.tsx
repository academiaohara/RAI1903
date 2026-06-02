"use client";

import type { SquadPlayer } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";
import { groupPlayersByPosition } from "@/lib/squad-utils";
import { PositionSection } from "@/components/squad/PositionSection";
import { PlayerCard } from "@/components/squad/PlayerCard";

type PlayerGridProps = {
  players: SquadPlayer[];
  onSelect: (player: SquadPlayer) => void;
  variant?: "default" | "fichas";
  showEmptyPositions?: boolean;
};

export function PlayerGrid({ players, onSelect, variant = "default", showEmptyPositions = false }: PlayerGridProps) {
  const grouped = groupPlayersByPosition(players);
  const isFichas = variant === "fichas";

  const content = (
    <div className="space-y-10">
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0 && !showEmptyPositions) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.05} variant={variant}>
            <div
              className={
                isFichas
                  ? "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {list.length === 0 ? (
                <p className="col-span-full text-sm font-semibold text-slate-400">Sin jugadores en esta posición</p>
              ) : (
                list.map((player, index) => (
                  <PlayerCard key={player.id} player={player} onSelect={onSelect} index={index} variant={variant} />
                ))
              )}
            </div>
          </PositionSection>
        );
      })}
    </div>
  );

  return content;
}
