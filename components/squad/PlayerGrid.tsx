"use client";

import type { SquadPlayer } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";
import { groupPlayersByPosition } from "@/lib/squad-utils";
import { PositionSection } from "@/components/squad/PositionSection";
import { PlayerCard } from "@/components/squad/PlayerCard";

type PlayerGridProps = {
  players: SquadPlayer[];
  onSelect: (player: SquadPlayer) => void;
};

export function PlayerGrid({ players, onSelect }: PlayerGridProps) {
  const grouped = groupPlayersByPosition(players);

  return (
    <div className="space-y-10">
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.05}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((player, index) => (
                <PlayerCard key={player.id} player={player} onSelect={onSelect} index={index} />
              ))}
            </div>
          </PositionSection>
        );
      })}
    </div>
  );
}
