"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerFullName } from "@/lib/squad-utils";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";

type SquadPlayerCardProps = {
  player: SquadPlayer;
  onSelect: (player: SquadPlayer) => void;
  index?: number;
};

export function PlayerCard({ player, onSelect, index = 0 }: SquadPlayerCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(player)}
      className="group w-full text-left"
    >
      <article className="card-shine relative overflow-hidden rounded-[1.75rem] border border-[#214C9B]/15 bg-gradient-to-b from-white via-slate-50 to-blue-50/40 p-4 shadow-[0_18px_45px_rgba(17,24,39,0.08)] transition-shadow duration-300 group-hover:border-[#214C9B]/35 group-hover:shadow-[0_28px_60px_rgba(33,76,155,0.18)]">
        <div className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#214C9B] text-xl font-extrabold text-white shadow-lg">
          {player.dorsal}
        </div>

        <div className="relative mx-auto mt-2 w-[78%]">
          <PlayerAvatar player={player} size="lg" className="mx-auto aspect-[4/5] h-auto w-full rounded-[1.25rem]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#173a78]/25 to-transparent" />
        </div>

        <div className="relative mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#214C9B]/70">{player.rol}</p>
            <h3 className="mt-1 text-lg font-extrabold uppercase leading-tight text-slate-900">{getPlayerFullName(player)}</h3>
            <p className="text-xs font-semibold text-slate-500">
              {player.edad} anos · {player.nacionalidad}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "G", value: player.goles },
              { label: "A", value: player.asistencias },
              { label: "TA", value: player.amarillas },
              { label: "TR", value: player.rojas },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200/80 bg-white/80 px-2 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">{stat.label}</p>
                <p className="text-lg font-extrabold tabular-nums text-[#214C9B]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </motion.button>
  );
}
