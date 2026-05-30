"use client";

import { motion } from "framer-motion";
import type { CanteraTeamId } from "@/lib/cantera-data";
import {
  formatCanteraGoals,
  getCanteraSquadImport,
  getCanteraSquadPlayers,
  type CanteraSquadPlayer,
} from "@/lib/cantera-squad";
import { SQUAD_POSITIONS, SQUAD_POSITION_LABELS, type SquadPosition } from "@/types/squad";
import { PositionSection } from "@/components/squad/PositionSection";
import { SquadListColGroup } from "@/components/squad/SquadListColGroup";

const OTHER_POSITION = "Otros" as const;

const alignClass = {
  left: "text-left",
  center: "text-center",
};

const cellPad = "px-4 py-3";

function groupPlayers(players: CanteraSquadPlayer[]): Map<SquadPosition | typeof OTHER_POSITION, CanteraSquadPlayer[]> {
  const groups = new Map<SquadPosition | typeof OTHER_POSITION, CanteraSquadPlayer[]>();
  for (const position of SQUAD_POSITIONS) {
    groups.set(position, []);
  }
  groups.set(OTHER_POSITION, []);

  for (const player of players) {
    if (player.posLabel.toLowerCase().includes("sin demarcación")) {
      groups.get(OTHER_POSITION)!.push(player);
      continue;
    }
    groups.get(player.posicion)!.push(player);
  }

  return groups;
}

function formatDorsal(dorsal: number | null): string {
  return dorsal == null || dorsal === 0 ? "—" : String(dorsal);
}

type CanteraSquadTableProps = {
  teamId: CanteraTeamId;
};

export function CanteraSquadTable({ teamId }: CanteraSquadTableProps) {
  const players = getCanteraSquadPlayers(teamId);
  const importData = getCanteraSquadImport(teamId);
  const grouped = groupPlayers(players);

  const sections: Array<{ key: string; label: string; list: CanteraSquadPlayer[] }> = [
    ...SQUAD_POSITIONS.map((position) => ({
      key: position,
      label: SQUAD_POSITION_LABELS[position],
      list: grouped.get(position) ?? [],
    })),
    { key: OTHER_POSITION, label: "Otros", list: grouped.get(OTHER_POSITION) ?? [] },
  ];

  const tableHeader = (
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <th className={`${cellPad} ${alignClass.center}`}>#</th>
        <th className={`${cellPad} ${alignClass.left}`}>Jugador</th>
        <th className={`${cellPad} ${alignClass.center}`}>Demarcación</th>
        <th className={`${cellPad} ${alignClass.center}`}>PC</th>
        <th className={`${cellPad} ${alignClass.center}`}>PJ</th>
        <th className={`${cellPad} ${alignClass.center}`}>PT</th>
        <th className={`${cellPad} ${alignClass.center}`}>Min</th>
        <th className={`${cellPad} ${alignClass.center}`}>Goles</th>
        <th className={`${cellPad} ${alignClass.center}`}>TA</th>
        <th className={`${cellPad} ${alignClass.center}`}>TR</th>
      </tr>
    </thead>
  );

  const renderTable = (list: CanteraSquadPlayer[]) => (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <SquadListColGroup variant="cantera" />
          {tableHeader}
          <tbody>
            {list.map((player, rowIndex) => (
              <motion.tr
                key={player.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.02 }}
                className="border-b border-slate-50 text-slate-800 last:border-0"
              >
                <td className={`${cellPad} font-bold text-[#214C9B] ${alignClass.center}`}>
                  {formatDorsal(player.dorsal)}
                </td>
                <td className={`max-w-[11.5rem] ${cellPad} font-semibold ${alignClass.left}`}>
                  <p className="truncate">{player.jugador}</p>
                </td>
                <td className={`${cellPad} truncate text-slate-600 ${alignClass.center}`}>{player.posLabel}</td>
                <td className={`${cellPad} ${alignClass.center}`}>{player.pc}</td>
                <td className={`${cellPad} ${alignClass.center}`}>{player.pj}</td>
                <td className={`${cellPad} ${alignClass.center}`}>{player.pt}</td>
                <td className={`${cellPad} ${alignClass.center}`}>{player.min}</td>
                <td className={`${cellPad} font-semibold ${alignClass.center}`}>{formatCanteraGoals(player)}</td>
                <td className={`${cellPad} ${alignClass.center}`}>{player.ta}</td>
                <td className={`${cellPad} ${alignClass.center}`}>{player.tr}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        <strong className="text-slate-900">{importData.plantilla.length} jugadores</strong>
        {" · "}
        Temporada 2025/26
      </p>

      <div className="space-y-10">
        {sections.map((section, sectionIndex) => {
          if (section.list.length === 0) return null;

          if (section.key === OTHER_POSITION) {
            return (
              <motion.section
                key={section.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.04, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-end gap-4">
                  <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#214C9B] sm:text-3xl">
                    {section.label}
                  </h2>
                  <div className="mb-2 h-px flex-1 bg-gradient-to-r from-[#214C9B]/35 via-[#214C9B]/10 to-transparent" />
                </div>
                {renderTable(section.list)}
              </motion.section>
            );
          }

          return (
            <PositionSection key={section.key} position={section.key as SquadPosition} delay={sectionIndex * 0.04}>
              {renderTable(section.list)}
            </PositionSection>
          );
        })}
      </div>
    </div>
  );
}
