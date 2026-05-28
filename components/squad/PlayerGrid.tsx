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
};

export function PlayerGrid({ players, onSelect, variant = "default" }: PlayerGridProps) {
  const grouped = groupPlayersByPosition(players);
  const isFichas = variant === "fichas";

  const content = (
    <div className="space-y-10">
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.05} variant={variant}>
            <div
              className={
                isFichas
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {list.map((player, index) => (
                <PlayerCard key={player.id} player={player} onSelect={onSelect} index={index} variant={variant} />
              ))}
            </div>
          </PositionSection>
        );
      })}
    </div>
  );

  if (isFichas) {
    return (
      <div className="rounded-[1.5rem] bg-gradient-to-b from-[#0f2347] via-[#122d57] to-[#0f2347] p-5 sm:rounded-[2rem] sm:p-8">
        {content}
      </div>
    );
  }

  return content;
}
