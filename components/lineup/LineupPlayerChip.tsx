"use client";

import { motion } from "framer-motion";
import { LineupMiniFicha } from "@/components/lineup/LineupMiniFicha";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import { cn } from "@/lib/utils";

type LineupPlayerChipProps = {
  player: SquadPlayer;
  index?: number;
  crestUrl?: string | null;
  selected?: boolean;
  assigned?: boolean;
  onSelect: (player: SquadPlayer) => void;
};

export function LineupPlayerChip({
  player,
  index = 0,
  crestUrl,
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
        "lineup-player-chip",
        selected && "lineup-player-chip--selected",
        assigned && !selected && "lineup-player-chip--assigned",
      )}
      aria-pressed={selected}
      aria-label={`${displayName}, dorsal ${player.dorsal}`}
    >
      <LineupMiniFicha player={player} size="sidebar" crestUrl={crestUrl} />
    </motion.button>
  );
}
