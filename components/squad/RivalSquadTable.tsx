"use client";

import { motion } from "framer-motion";
import type { SquadPlayer, SquadPosition } from "@/types/squad";
import { SQUAD_POSITION_LABELS, SQUAD_POSITIONS } from "@/types/squad";
import { formatPlayerAge, getPlayerFullName, groupPlayersByPosition } from "@/lib/squad-utils";
import { PositionSection } from "@/components/squad/PositionSection";
import { PreferredFootIcon } from "@/components/squad/PreferredFootIcon";

type RivalSquadTableProps = {
  players: SquadPlayer[];
};

function RivalSquadColGroup() {
  return (
    <colgroup>
      <col className="w-12" />
      <col className="w-[11.5rem]" />
      <col className="w-12" />
      <col className="w-14" />
      <col className="w-12" />
      <col className="w-16" />
      <col className="w-12" />
    </colgroup>
  );
}

const cellPad = "px-4 py-3";

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
                <table className="w-full min-w-[640px] table-fixed border-collapse">
                  <RivalSquadColGroup />
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className={`${cellPad} text-center`}>#</th>
                      <th className={`${cellPad} text-left`}>Jugador</th>
                      <th className={`${cellPad} text-center`}>Pos.</th>
                      <th className={`${cellPad} text-center`}>Edad</th>
                      <th className={`${cellPad} text-center`}>Pie</th>
                      <th className={`${cellPad} text-center`}>Altura</th>
                      <th className={`${cellPad} text-center`}>G</th>
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
                        <td className={`${cellPad} text-center font-extrabold text-[#214C9B]`}>{player.dorsal}</td>
                        <td className={`${cellPad} font-semibold text-slate-800`}>{getPlayerFullName(player)}</td>
                        <td className={`${cellPad} text-center text-xs font-bold text-slate-600`}>{player.rol}</td>
                        <td className={`${cellPad} text-center text-slate-700`}>{formatPlayerAge(player.edad)}</td>
                        <td className={`${cellPad} text-center`}>
                          <PreferredFootIcon foot={player.piernaBuena} size={16} className="mx-auto" />
                        </td>
                        <td className={`${cellPad} text-center text-xs font-semibold text-slate-700`}>
                          {player.altura || "—"}
                        </td>
                        <td className={`${cellPad} text-center font-extrabold text-slate-800`}>{player.goles}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_2.5rem_2.5rem] gap-2 bg-slate-50/90 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <span>#</span>
                  <span>{SQUAD_POSITION_LABELS[position as SquadPosition]}</span>
                  <span className="text-center">Ed</span>
                  <span className="text-center">Pie</span>
                  <span className="text-center">G</span>
                </div>
                {list.map((player) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_2.5rem_2.5rem] items-center gap-2 px-3 py-2.5"
                  >
                    <span className="text-center text-sm font-extrabold text-[#214C9B]">{player.dorsal}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{getPlayerFullName(player)}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-500">
                        {player.rol} · {player.altura || "—"}
                      </p>
                    </div>
                    <span className="text-center text-xs font-semibold text-slate-700">{formatPlayerAge(player.edad)}</span>
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
