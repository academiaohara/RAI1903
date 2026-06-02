"use client";

import { motion } from "framer-motion";
import type { CanteraTeamId } from "@/lib/cantera-data";
import {
  formatCanteraGoals,
  getCanteraSquadPlayersFromImport,
  type CanteraSquadPlayer,
} from "@/lib/cantera-squad";
import type { CanteraSquadImport, CanteraSquadImportPlayer } from "@/types/cantera-squad-import";
import { SQUAD_POSITIONS, SQUAD_POSITION_LABELS, type SquadPosition } from "@/types/squad";
import { PositionSection } from "@/components/squad/PositionSection";
import { SquadListColGroup } from "@/components/squad/SquadListColGroup";

const OTHER_POSITION = "Otros" as const;

const alignClass = {
  left: "text-left",
  center: "text-center",
};

const cellPad = "px-4 py-3";

const statInputClass =
  "w-full min-w-[2.25rem] max-w-[3.5rem] rounded-md border border-[#214C9B]/25 bg-white px-1 py-0.5 text-center text-sm font-semibold text-slate-800 focus:border-[#214C9B] focus:outline-none focus:ring-1 focus:ring-[#214C9B]/30";

type StatKey = keyof Pick<CanteraSquadImportPlayer, "pc" | "pj" | "pt" | "min" | "goles" | "ta" | "tr">;

const STAT_COLUMNS: Array<{ key: StatKey; label: string }> = [
  { key: "pc", label: "PC" },
  { key: "pj", label: "PJ" },
  { key: "pt", label: "PT" },
  { key: "min", label: "Min" },
  { key: "goles", label: "Goles" },
  { key: "ta", label: "TA" },
  { key: "tr", label: "TR" },
];

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

function parseStatValue(raw: string): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function CanteraStatCell({
  editMode,
  value,
  onChange,
  className = "",
  goalsDisplay,
}: {
  editMode: boolean;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  goalsDisplay?: string;
}) {
  if (!editMode) {
    return <span className={className}>{goalsDisplay ?? value}</span>;
  }

  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(parseStatValue(e.target.value))}
      className={statInputClass}
      aria-label="Estadística"
    />
  );
}

type CanteraSquadTableProps = {
  teamId: CanteraTeamId;
  squadImport: CanteraSquadImport;
  seasonLabel: string;
  editMode?: boolean;
  onStatUpdate?: (playerId: string, patch: Partial<CanteraSquadImportPlayer>) => void;
};

export function CanteraSquadTable({
  teamId,
  squadImport,
  seasonLabel,
  editMode = false,
  onStatUpdate,
}: CanteraSquadTableProps) {
  const players = getCanteraSquadPlayersFromImport(squadImport, teamId);
  const importData = squadImport;
  const grouped = groupPlayers(players);
  const canEditStats = editMode && Boolean(onStatUpdate);

  const updateStat = (player: CanteraSquadPlayer, patch: Partial<CanteraSquadImportPlayer>) => {
    onStatUpdate?.(player.id, patch);
  };

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
        {STAT_COLUMNS.map((col) => (
          <th key={col.key} className={`${cellPad} ${alignClass.center}`}>
            {col.label}
          </th>
        ))}
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
            {list.map((player, rowIndex) => {
              const isGoalkeeper = player.posicion === "Portero";
              return (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  className={`border-b border-slate-50 text-slate-800 last:border-0 ${
                    canEditStats ? "bg-[#214C9B]/[0.02]" : ""
                  }`}
                >
                  <td className={`${cellPad} font-bold text-[#214C9B] ${alignClass.center}`}>
                    {formatDorsal(player.dorsal)}
                  </td>
                  <td className={`max-w-[11.5rem] ${cellPad} font-semibold ${alignClass.left}`}>
                    <p className="truncate">{player.jugador}</p>
                  </td>
                  <td className={`${cellPad} truncate text-slate-600 ${alignClass.center}`}>{player.posLabel}</td>
                  {STAT_COLUMNS.map((col) => {
                    if (col.key === "goles" && isGoalkeeper) {
                      const conceded = player.golesEncajados ?? player.goles;
                      return (
                        <td key={col.key} className={`${cellPad} ${alignClass.center}`}>
                          <CanteraStatCell
                            editMode={canEditStats}
                            value={conceded}
                            onChange={(value) =>
                              updateStat(player, { golesEncajados: value, goles: player.goles })
                            }
                            className="font-semibold"
                            goalsDisplay={formatCanteraGoals(player)}
                          />
                        </td>
                      );
                    }

                    return (
                      <td
                        key={col.key}
                        className={`${cellPad} ${alignClass.center} ${col.key === "goles" ? "font-semibold" : ""}`}
                      >
                        <CanteraStatCell
                          editMode={canEditStats}
                          value={player[col.key]}
                          onChange={(value) => updateStat(player, { [col.key]: value })}
                          goalsDisplay={col.key === "goles" ? formatCanteraGoals(player) : undefined}
                        />
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
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
        Temporada {seasonLabel}
        {canEditStats ? (
          <>
            {" · "}
            <span className="text-[#214C9B]">Pulsa en las cifras para editarlas</span>
          </>
        ) : null}
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
