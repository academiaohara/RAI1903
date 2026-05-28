"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { getSquadFieldPlacement, groupPlayersByRole } from "@/lib/squad-field-layout";
import {
  getNationalityFlagUrl,
  getPlayerDisplayName,
} from "@/lib/squad-utils";
import { FieldPlayerFicha } from "@/components/squad/FieldPlayerFicha";

type SquadFieldProps = {
  players: SquadPlayer[];
  onSelect: (player: SquadPlayer) => void;
};

export function SquadField({ players, onSelect }: SquadFieldProps) {
  const roleGroups = groupPlayersByRole(players);
  const placements: Array<{ player: SquadPlayer; x: number; y: number; index: number }> = [];
  let cardIndex = 0;

  for (const [, group] of roleGroups) {
    group.forEach((player, indexInRole) => {
      const { x, y } = getSquadFieldPlacement(player, indexInRole, group.length);
      placements.push({ player, x, y, index: cardIndex });
      cardIndex += 1;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[700px]"
    >
      <div className="squad-pitch relative aspect-[1/1.25] w-full overflow-hidden rounded-2xl">
        {placements.map(({ player, x, y, index }) => (
          <FieldPlayerFicha
            key={player.id}
            name={getPlayerDisplayName(player)}
            imageUrl={player.foto}
            flagUrl={getNationalityFlagUrl(player.nacionalidad)}
            flagAlt={player.nacionalidad}
            x={x}
            y={y}
            index={index}
            onClick={() => onSelect(player)}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-slate-500">
        Pulsa una ficha para ver la ficha completa del jugador
      </p>
    </motion.div>
  );
}
