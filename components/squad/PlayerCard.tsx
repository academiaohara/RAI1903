"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerDisplayName, getPlayerFullName } from "@/lib/squad-utils";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";

type SquadPlayerCardProps = {
  player: SquadPlayer;
  onSelect: (player: SquadPlayer) => void;
  index?: number;
  variant?: "default" | "fichas";
};

export function PlayerCard({ player, onSelect, index = 0, variant = "default" }: SquadPlayerCardProps) {
  if (variant === "fichas") {
    return <PlayerFichaCard player={player} onSelect={onSelect} index={index} />;
  }

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

function PlayerFichaCard({
  player,
  onSelect,
  index,
}: {
  player: SquadPlayer;
  onSelect: (player: SquadPlayer) => void;
  index: number;
}) {
  const displayName = getPlayerDisplayName(player);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(player)}
      className="group w-full text-left"
    >
      <article className="overflow-hidden rounded-sm bg-[#1c3d6e]/90 transition hover:bg-[#234b82]/95">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#214C9B] via-[#2a5eb5] to-[#173a78]">
          <div className="absolute inset-0 scale-125 opacity-70 blur-3xl">
            <PlayerAvatar player={player} bare className="h-full w-full" />
          </div>
          <div className="absolute inset-0 bg-[#0f2347]/30" />
          <div className="relative flex h-full items-end justify-center px-2 pb-0 pt-3">
            <PlayerAvatar player={player} bare className="aspect-[3/4] h-[94%] w-auto max-w-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]" />
          </div>
        </div>

        <div className="h-px bg-white/90" />

        <p className="px-3 py-2.5 text-sm font-semibold text-white sm:text-[15px]">
          <span className="tabular-nums">{player.dorsal}</span>
          <span className="mx-2 text-white/60">|</span>
          <span>{displayName}</span>
        </p>
      </article>
    </motion.button>
  );
}
