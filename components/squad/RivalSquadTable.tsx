"use client";

import { motion } from "framer-motion";
import type { SquadPlayer, SquadPosition } from "@/types/squad";
import { SQUAD_POSITION_LABELS, SQUAD_POSITIONS } from "@/types/squad";
import { getPlayerFullName, groupPlayersByPosition } from "@/lib/squad-utils";
import { PositionSection } from "@/components/squad/PositionSection";
import { PreferredFootIcon } from "@/components/squad/PreferredFootIcon";

type RivalSquadTableProps = {
  players: SquadPlayer[];
};

export function RivalSquadTable({ players }: RivalSquadTableProps) {
  const grouped = groupPlayersByPosition(players);

  return (
    <div className="space-y-5 md:space-y-8">
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.04} hideHeadingOnMobile>
            <div className="overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3 text-center">#</th>
                      <th className="px-4 py-3 text-left">Jugador</th>
                      <th className="px-4 py-3 text-center">Pos.</th>
                      <th className="px-4 py-3 text-center">Pie</th>
                      <th className="px-4 py-3 text-center">G</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((player, rowIndex) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rowIndex * 0.02 }}
                        className="border-b border-slate-50 text-sm"
                      >
                        <td className="px-4 py-3 text-center font-extrabold text-[#214C9B]">{player.dorsal}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{getPlayerFullName(player)}</td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{player.rol}</td>
                        <td className="px-4 py-3 text-center">
                          <PreferredFootIcon foot={player.piernaBuena} size={16} className="mx-auto" />
                        </td>
                        <td className="px-4 py-3 text-center font-extrabold text-slate-800">{player.goles}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_3rem_3rem] gap-2 bg-slate-50/90 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <span>#</span>
                  <span>{SQUAD_POSITION_LABELS[position as SquadPosition]}</span>
                  <span className="text-center">Pie</span>
                  <span className="text-center">G</span>
                </div>
                {list.map((player) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)_3rem_3rem] items-center gap-2 px-3 py-2.5"
                  >
                    <span className="text-center text-sm font-extrabold text-[#214C9B]">{player.dorsal}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{getPlayerFullName(player)}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-500">{player.rol}</p>
                    </div>
                    <div className="flex justify-center">
                      <PreferredFootIcon foot={player.piernaBuena} size={14} />
                    </div>
                    <span className="text-center text-sm font-extrabold text-slate-800">{player.goles}</span>
                  </div>
                ))}
              </div>
            </div>
          </PositionSection>
        );
      })}
    </div>
  );
}
