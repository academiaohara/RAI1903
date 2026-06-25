"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { cn } from "@/lib/utils";

type LineupPlayerChipProps = {
  player: SquadPlayer;
  index?: number;
  selected?: boolean;
  assigned?: boolean;
  onSelect: (player: SquadPlayer) => void;
};

export function LineupPlayerChip({
  player,
  index = 0,
  selected = false,
  assigned = false,
  onSelect,
}: LineupPlayerChipProps) {
  const displayName = getPlayerDisplayName(player);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015, duration: 0.25 }}
      onClick={() => onSelect(player)}
      className={cn(
        "lineup-player-chip group text-left",
        selected && "lineup-player-chip--selected",
        assigned && !selected && "lineup-player-chip--assigned",
      )}
      aria-pressed={selected}
      aria-label={`${displayName}, dorsal ${player.dorsal}`}
    >
      <span className="lineup-player-chip-dorsal">{player.dorsal}</span>
      <div className="lineup-player-chip-photo">
        <PlayerAvatar
          player={player}
          bare
          placeholderTone="light"
          imageClassName="object-cover object-top"
          className="h-full w-full"
        />
      </div>
      <div className="lineup-player-chip-meta">
        <p className="lineup-player-chip-role">{player.rol}</p>
        <p className="lineup-player-chip-name">{displayName}</p>
      </div>
    </motion.button>
  );
}
