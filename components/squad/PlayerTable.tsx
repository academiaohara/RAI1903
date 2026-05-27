"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";
import { formatContractDate, getPlayerFullName, groupPlayersByPosition } from "@/lib/squad-utils";
import { PositionSection } from "@/components/squad/PositionSection";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";

type PlayerTableProps = {
  players: SquadPlayer[];
  onSelect: (player: SquadPlayer) => void;
};

const columns = ["Jugador", "Pos.", "Edad", "PJ", "G", "A", "TA", "TR", "Contrato"] as const;

export function PlayerTable({ players, onSelect }: PlayerTableProps) {
  const grouped = groupPlayersByPosition(players);

  return (
    <div className="space-y-10">
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.04}>
            <div className="overflow-hidden rounded-[1.5rem] border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">#</th>
                      {columns.map((col) => (
                        <th key={col} className="px-4 py-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((player, rowIndex) => (
                      <PlayerRow key={player.id} player={player} onSelect={onSelect} index={rowIndex} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {list.map((player, rowIndex) => (
                  <PlayerMobileRow key={player.id} player={player} onSelect={onSelect} index={rowIndex} />
                ))}
              </div>
            </div>
          </PositionSection>
        );
      })}
    </div>
  );
}

function PlayerRow({
  player,
  onSelect,
  index,
}: {
  player: SquadPlayer;
  onSelect: (player: SquadPlayer) => void;
  index: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      onClick={() => onSelect(player)}
      className="group cursor-pointer border-b border-slate-50 text-sm transition last:border-0 hover:bg-blue-50/60"
    >
      <td className="px-5 py-4 font-extrabold tabular-nums text-[#214C9B]">{player.dorsal}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <PlayerAvatar player={player} size="sm" className="rounded-xl" />
          <div>
            <p className="font-extrabold uppercase text-slate-900">{getPlayerFullName(player)}</p>
            <p className="text-xs font-semibold text-slate-500">{player.nacionalidad}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 font-semibold text-slate-600">{player.posicion}</td>
      <td className="px-4 py-4 tabular-nums text-slate-700">{player.edad}</td>
      <StatCell value={player.partidos} />
      <StatCell value={player.goles} highlight={player.goles > 0} />
      <StatCell value={player.asistencias} highlight={player.asistencias > 0} />
      <StatCell value={player.amarillas} warn={player.amarillas > 0} />
      <StatCell value={player.rojas} warn={player.rojas > 0} />
      <td className="px-4 py-4 text-xs font-bold uppercase text-slate-500">{formatContractDate(player.contratoHasta)}</td>
    </motion.tr>
  );
}

function PlayerMobileRow({
  player,
  onSelect,
  index,
}: {
  player: SquadPlayer;
  onSelect: (player: SquadPlayer) => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onSelect(player)}
      className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-blue-50/70"
    >
      <PlayerAvatar player={player} size="md" className="rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#214C9B]">#{player.dorsal}</span>
          <p className="truncate font-extrabold uppercase text-slate-900">{getPlayerFullName(player)}</p>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          {player.posicion} · {player.edad} anos
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
          <span className="rounded-lg bg-slate-100 px-2 py-1">PJ {player.partidos}</span>
          <span className="rounded-lg bg-slate-100 px-2 py-1">G {player.goles}</span>
          <span className="rounded-lg bg-slate-100 px-2 py-1">A {player.asistencias}</span>
        </div>
      </div>
    </motion.button>
  );
}

function StatCell({ value, highlight = false, warn = false }: { value: number; highlight?: boolean; warn?: boolean }) {
  return (
    <td
      className={`px-4 py-4 text-center font-extrabold tabular-nums ${
        warn && value > 0 ? "text-red-600" : highlight ? "text-[#214C9B]" : "text-slate-700"
      }`}
    >
      {value}
    </td>
  );
}
