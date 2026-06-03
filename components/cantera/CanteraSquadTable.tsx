"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
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

type MobileDataView = "stats" | "info";

const mobileGridClass = {
  stats: "grid-cols-[minmax(7.25rem,1fr)_repeat(5,minmax(1.75rem,2rem))]",
  info: "grid-cols-[minmax(7.25rem,1fr)_minmax(3.5rem,4.5rem)_repeat(2,minmax(2rem,2.5rem))]",
};

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
  const [mobileDataView, setMobileDataView] = useState<MobileDataView>("stats");
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

  const renderDesktopTable = (list: CanteraSquadPlayer[]) => (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
        <SquadListColGroup variant="cantera" />
        {tableHeader}
        <tbody>
          {list.map((player, rowIndex) => (
            <CanteraDesktopRow
              key={player.id}
              player={player}
              rowIndex={rowIndex}
              canEditStats={canEditStats}
              onUpdateStat={(patch) => updateStat(player, patch)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMobileList = (list: CanteraSquadPlayer[], positionLabel: string) => (
    <div className="divide-y divide-slate-100 md:hidden">
      <CanteraMobileSectionHeader label={positionLabel} view={mobileDataView} />
      {list.map((player, rowIndex) => (
        <CanteraMobileRow
          key={player.id}
          player={player}
          rowIndex={rowIndex}
          view={mobileDataView}
          canEditStats={canEditStats}
          onUpdateStat={(patch) => updateStat(player, patch)}
        />
      ))}
    </div>
  );

  const renderPositionBlock = (list: CanteraSquadPlayer[], positionLabel: string) => (
    <div className="overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)] md:rounded-[1.5rem]">
      {renderDesktopTable(list)}
      {renderMobileList(list, positionLabel)}
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

      <CanteraMobileDataToggle value={mobileDataView} onChange={setMobileDataView} />

      <div className="space-y-5 md:space-y-10">
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
                <div className="hidden items-end gap-4 md:flex">
                  <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#214C9B] sm:text-3xl">
                    {section.label}
                  </h2>
                  <div className="mb-2 h-px flex-1 bg-gradient-to-r from-[#214C9B]/35 via-[#214C9B]/10 to-transparent" />
                </div>
                {renderPositionBlock(section.list, section.label)}
              </motion.section>
            );
          }

          return (
            <PositionSection
              key={section.key}
              position={section.key as SquadPosition}
              delay={sectionIndex * 0.04}
              hideHeadingOnMobile
            >
              {renderPositionBlock(section.list, SQUAD_POSITION_LABELS[section.key as SquadPosition])}
            </PositionSection>
          );
        })}
      </div>
    </div>
  );
}

function CanteraDesktopRow({
  player,
  rowIndex,
  canEditStats,
  onUpdateStat,
}: {
  player: CanteraSquadPlayer;
  rowIndex: number;
  canEditStats: boolean;
  onUpdateStat: (patch: Partial<CanteraSquadImportPlayer>) => void;
}) {
  const isGoalkeeper = player.posicion === "Portero";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rowIndex * 0.02 }}
      className={`border-b border-slate-50 text-slate-800 last:border-0 ${
        canEditStats ? "bg-[#214C9B]/[0.02]" : ""
      }`}
    >
      <td className={`${cellPad} font-bold text-[#214C9B] ${alignClass.center}`}>{formatDorsal(player.dorsal)}</td>
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
                onChange={(value) => onUpdateStat({ golesEncajados: value, goles: player.goles })}
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
              onChange={(value) => onUpdateStat({ [col.key]: value })}
              goalsDisplay={col.key === "goles" ? formatCanteraGoals(player) : undefined}
            />
          </td>
        );
      })}
    </motion.tr>
  );
}

function CanteraMobileRow({
  player,
  rowIndex,
  view,
  canEditStats,
  onUpdateStat,
}: {
  player: CanteraSquadPlayer;
  rowIndex: number;
  view: MobileDataView;
  canEditStats: boolean;
  onUpdateStat: (patch: Partial<CanteraSquadImportPlayer>) => void;
}) {
  const isGoalkeeper = player.posicion === "Portero";
  const goalsValue = isGoalkeeper ? (player.golesEncajados ?? player.goles) : player.goles;
  const goalsDisplay = formatCanteraGoals(player);

  const updateGoals = (value: number) => {
    if (isGoalkeeper) {
      onUpdateStat({ golesEncajados: value, goles: player.goles });
      return;
    }
    onUpdateStat({ goles: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rowIndex * 0.03 }}
      className={`grid w-full min-w-0 items-center gap-1.5 px-2 py-2 ${mobileGridClass[view]}`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="w-4 shrink-0 text-center text-[10px] font-bold tabular-nums text-[#214C9B]">
          {formatDorsal(player.dorsal)}
        </span>
        <span className="min-w-0 truncate text-[10.5px] font-extrabold text-slate-900">{player.jugador}</span>
      </span>
      {view === "stats" ? (
        <>
          <CanteraMobileStat value={player.pc} editMode={canEditStats} onChange={(v) => onUpdateStat({ pc: v })} />
          <CanteraMobileStat value={player.pj} editMode={canEditStats} onChange={(v) => onUpdateStat({ pj: v })} />
          <CanteraMobileStat
            value={goalsValue}
            editMode={canEditStats}
            onChange={updateGoals}
            display={goalsDisplay}
            highlight
          />
          <CanteraMobileStat
            value={player.ta}
            editMode={canEditStats}
            onChange={(v) => onUpdateStat({ ta: v })}
            warn={player.ta > 0}
          />
          <CanteraMobileStat
            value={player.tr}
            editMode={canEditStats}
            onChange={(v) => onUpdateStat({ tr: v })}
            warn={player.tr > 0}
          />
        </>
      ) : (
        <>
          <MobileValue compact>{player.posLabel}</MobileValue>
          <CanteraMobileStat value={player.pt} editMode={canEditStats} onChange={(v) => onUpdateStat({ pt: v })} />
          <CanteraMobileStat value={player.min} editMode={canEditStats} onChange={(v) => onUpdateStat({ min: v })} />
        </>
      )}
    </motion.div>
  );
}

function CanteraMobileStat({
  value,
  display,
  editMode,
  onChange,
  highlight = false,
  warn = false,
}: {
  value: number;
  display?: string;
  editMode: boolean;
  onChange: (value: number) => void;
  highlight?: boolean;
  warn?: boolean;
}) {
  if (editMode) {
    return (
      <CanteraStatCell
        editMode
        value={value}
        onChange={onChange}
        goalsDisplay={display}
        className="text-center text-[10.5px] font-bold tabular-nums"
      />
    );
  }

  return (
    <MobileValue warn={warn} highlight={highlight}>
      {display ?? value}
    </MobileValue>
  );
}

function CanteraMobileDataToggle({
  value,
  onChange,
}: {
  value: MobileDataView;
  onChange: (view: MobileDataView) => void;
}) {
  const options: Array<{ id: MobileDataView; label: string }> = [
    { id: "stats", label: "Rendimiento" },
    { id: "info", label: "Demarcación" },
  ];

  return (
    <div className="md:hidden">
      <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-xl px-3 py-2 text-[11px] font-extrabold uppercase tracking-wide transition ${
                active ? "bg-[#214C9B] text-white shadow-sm" : "text-slate-500"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CanteraMobileSectionHeader({ label, view }: { label: string; view: MobileDataView }) {
  return (
    <div
      className={`grid items-center gap-1.5 border-b border-slate-100 bg-slate-50/90 px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${mobileGridClass[view]}`}
    >
      <span>{label}</span>
      {view === "stats" ? (
        <>
          <span className="text-center">PC</span>
          <span className="text-center">PJ</span>
          <span className="text-center" aria-label="Goles">
            ⚽
          </span>
          <span className="text-center" aria-label="Tarjetas amarillas">
            🟨
          </span>
          <span className="text-center" aria-label="Tarjetas rojas">
            🟥
          </span>
        </>
      ) : (
        <>
          <span className="text-center">Dem.</span>
          <span className="text-center">PT</span>
          <span className="text-center">Min</span>
        </>
      )}
    </div>
  );
}

function MobileValue({
  children,
  warn = false,
  highlight = false,
  compact = false,
}: {
  children: ReactNode;
  warn?: boolean;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`min-w-0 truncate text-center font-bold tabular-nums ${
        compact ? "text-[9.5px]" : "text-[10.5px]"
      } ${warn ? "text-red-600" : highlight ? "text-[#214C9B]" : "text-slate-700"}`}
    >
      {children}
    </span>
  );
}
