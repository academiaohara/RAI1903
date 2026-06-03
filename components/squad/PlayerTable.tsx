"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { SQUAD_POSITION_LABELS, SQUAD_POSITIONS } from "@/types/squad";
import {
  formatContractDate,
  formatPlayerAge,
  getPlayerFullName,
  groupPlayersByPosition,
} from "@/lib/squad-utils";
import { PositionSection } from "@/components/squad/PositionSection";
import { SquadListColGroup } from "@/components/squad/SquadListColGroup";
import { SquadPlayerQuickEdit } from "@/components/squad/SquadPlayerQuickEdit";

type PlayerTableProps = {
  players: SquadPlayer[];
  onSelect?: (player: SquadPlayer) => void;
  showMarketValue?: boolean;
  showAge?: boolean;
  showEmptyPositions?: boolean;
  editMode?: boolean;
  onQuickUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
};

const alignClass = {
  left: "text-left",
  center: "text-center",
};

const cellPad = "px-4 py-3";
type MobileDataView = "stats" | "info";

const mobileGridClass = {
  stats: "grid-cols-[minmax(7.25rem,1fr)_repeat(5,minmax(1.75rem,2rem))]",
  info: "grid-cols-[minmax(7.25rem,1fr)_repeat(3,minmax(2.75rem,3.25rem))]",
};

export function PlayerTable({
  players,
  onSelect,
  showMarketValue = false,
  showAge = true,
  showEmptyPositions = false,
  editMode = false,
  onQuickUpdate,
}: PlayerTableProps) {
  const [mobileDataView, setMobileDataView] = useState<MobileDataView>("stats");
  const grouped = groupPlayersByPosition(players);

  const columns = [
    { key: "jugador", label: "Jugador", align: "left" as const },
    { key: "pos", label: "Pos.", align: "center" as const },
    ...(showAge ? [{ key: "edad", label: "Edad", align: "center" as const }] : []),
    { key: "pj", label: "PJ", align: "center" as const },
    { key: "g", label: "G", align: "center" as const },
    { key: "a", label: "A", align: "center" as const },
    { key: "ta", label: "TA", align: "center" as const },
    { key: "tr", label: "TR", align: "center" as const },
    ...(showMarketValue
      ? [
          { key: "valor", label: "Valor", align: "center" as const },
          { key: "contrato", label: "Contrato", align: "center" as const },
        ]
      : [{ key: "contrato", label: "Contrato", align: "center" as const }]),
  ];

  return (
    <div className="space-y-5 md:space-y-10">
      <MobileDataToggle value={mobileDataView} onChange={setMobileDataView} />
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0 && !showEmptyPositions) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.04} hideHeadingOnMobile>
            <div className="overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)] md:rounded-[1.5rem]">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] table-fixed border-collapse">
                  <SquadListColGroup
                    variant="primer-equipo"
                    showAge={showAge}
                    showMarketValue={showMarketValue}
                  />
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className={`${cellPad} ${alignClass.center}`}>#</th>
                      {columns.map((col) => (
                        <th key={col.key} className={`${cellPad} ${alignClass[col.align]}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-sm font-semibold text-slate-400">
                          Sin jugadores en esta posición
                        </td>
                      </tr>
                    ) : (
                      list.map((player, rowIndex) => (
                        <PlayerRow
                          key={player.id}
                          player={player}
                          onSelect={onSelect}
                          index={rowIndex}
                          showMarketValue={showMarketValue}
                          showAge={showAge}
                          editMode={editMode}
                          onQuickUpdate={onQuickUpdate}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                <MobileSectionHeader
                  position={position}
                  view={mobileDataView}
                />
                {list.length === 0 ? (
                  <p className="p-4 text-center text-sm font-semibold text-slate-400">Sin jugadores en esta posición</p>
                ) : (
                  list.map((player, rowIndex) => (
                    <PlayerMobileRow
                      key={player.id}
                      player={player}
                      onSelect={onSelect}
                      index={rowIndex}
                      view={mobileDataView}
                      editMode={editMode}
                      onQuickUpdate={onQuickUpdate}
                    />
                  ))
                )}
              </div>
            </div>
          </PositionSection>
        );
      })}
    </div>
  );
}

function squadTableColumnCount(showAge: boolean, showMarketValue: boolean) {
  return 2 + 1 + (showAge ? 1 : 0) + 5 + (showMarketValue ? 1 : 0) + 1;
}

function PlayerRow({
  player,
  onSelect,
  index,
  showMarketValue,
  showAge,
  editMode,
  onQuickUpdate,
}: {
  player: SquadPlayer;
  onSelect?: (player: SquadPlayer) => void;
  index: number;
  showMarketValue: boolean;
  showAge: boolean;
  editMode?: boolean;
  onQuickUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
}) {
  const interactive = Boolean(onSelect);
  const canQuickEdit = editMode && onQuickUpdate;
  const columnCount = squadTableColumnCount(showAge, showMarketValue);

  if (canQuickEdit) {
    return (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.02 }}
        className="border-b border-slate-50 bg-blue-50/30 text-sm last:border-0"
      >
        <td className={cellPad} colSpan={columnCount}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <SquadPlayerQuickEdit
              player={player}
              onUpdate={(patch) => onQuickUpdate(player.id, patch)}
              layout="row"
            />
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(player)}
                className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B] hover:underline"
              >
                Ficha completa
              </button>
            ) : null}
          </div>
        </td>
      </motion.tr>
    );
  }

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      onClick={interactive ? () => onSelect?.(player) : undefined}
      className={`group border-b border-slate-50 text-sm transition last:border-0 ${
        interactive ? "cursor-pointer hover:bg-blue-50/60" : ""
      }`}
    >
      <td className={`${cellPad} font-extrabold tabular-nums text-[#214C9B] ${alignClass.center}`}>
        {player.dorsal}
      </td>
      <td className={`max-w-[11.5rem] ${cellPad} ${alignClass.left}`}>
        <p className="truncate text-sm font-extrabold uppercase text-slate-900">{getPlayerFullName(player)}</p>
      </td>
      <td className={`${cellPad} text-xs font-extrabold tracking-wide text-slate-600 ${alignClass.center}`}>
        {player.rol}
      </td>
      {showAge && (
        <td className={`${cellPad} tabular-nums text-slate-700 ${alignClass.center}`}>
          {formatPlayerAge(player.edad)}
        </td>
      )}
      <StatCell value={player.partidos} />
      <StatCell value={player.goles} highlight={player.goles > 0} />
      <StatCell value={player.asistencias} highlight={player.asistencias > 0} />
      <StatCell value={player.amarillas} warn={player.amarillas > 0} />
      <StatCell value={player.rojas} warn={player.rojas > 0} />
      {showMarketValue && (
        <td className={`${cellPad} text-[10px] font-bold leading-tight tabular-nums text-slate-600 ${alignClass.center}`}>
          {player.valorMercado ?? "—"}
        </td>
      )}
      <td className={`${cellPad} text-xs font-bold tabular-nums text-slate-500 ${alignClass.center}`}>
        {formatContractDate(player.contratoHasta)}
      </td>
    </motion.tr>
  );
}

function PlayerMobileRow({
  player,
  onSelect,
  index,
  view,
  editMode,
  onQuickUpdate,
}: {
  player: SquadPlayer;
  onSelect?: (player: SquadPlayer) => void;
  index: number;
  view: MobileDataView;
  editMode?: boolean;
  onQuickUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
}) {
  const canQuickEdit = editMode && onQuickUpdate;

  if (canQuickEdit) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="space-y-2 border-b border-slate-100 bg-blue-50/30 p-4"
      >
        <SquadPlayerQuickEdit
          player={player}
          onUpdate={(patch) => onQuickUpdate(player.id, patch)}
          layout="row"
        />
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(player)}
            className="text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B] hover:underline"
          >
            Ficha completa
          </button>
        ) : null}
      </motion.div>
    );
  }

  const content = (
    <>
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="w-4 shrink-0 text-center text-[10px] font-bold tabular-nums text-[#214C9B]">{player.dorsal}</span>
        <span className="min-w-0 truncate text-[10.5px] font-extrabold text-slate-900">{getPlayerFullName(player)}</span>
      </span>
      {view === "stats" ? (
        <>
          <MobileValue>{player.partidos}</MobileValue>
          <MobileValue>{player.goles}</MobileValue>
          <MobileValue>{player.asistencias}</MobileValue>
          <MobileValue warn={player.amarillas > 0}>{player.amarillas}</MobileValue>
          <MobileValue warn={player.rojas > 0}>{player.rojas}</MobileValue>
        </>
      ) : (
        <>
          <MobileValue>{formatPlayerAge(player.edad)}</MobileValue>
          <MobileValue compact>{player.valorMercado ?? "—"}</MobileValue>
          <MobileValue compact>{formatContractDate(player.contratoHasta)}</MobileValue>
        </>
      )}
    </>
  );

  const rowClassName =
    `grid w-full min-w-0 items-center gap-1.5 px-2 py-2 ${mobileGridClass[view]}`;

  if (!onSelect) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={rowClassName}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onSelect(player)}
      className={`${rowClassName} text-left transition hover:bg-blue-50/70`}
    >
      {content}
    </motion.button>
  );
}

function StatCell({ value, highlight = false, warn = false }: { value: number; highlight?: boolean; warn?: boolean }) {
  return (
    <td
      className={`${cellPad} text-center font-extrabold tabular-nums ${
        warn && value > 0 ? "text-red-600" : highlight ? "text-[#214C9B]" : "text-slate-700"
      }`}
    >
      {value}
    </td>
  );
}

function MobileDataToggle({
  value,
  onChange,
}: {
  value: MobileDataView;
  onChange: (view: MobileDataView) => void;
}) {
  const options: Array<{ id: MobileDataView; label: string }> = [
    { id: "stats", label: "Partidos" },
    { id: "info", label: "Info" },
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

function MobileSectionHeader({
  position,
  view,
}: {
  position: (typeof SQUAD_POSITIONS)[number];
  view: MobileDataView;
}) {
  return (
    <div
      className={`grid items-center gap-1.5 border-b border-slate-100 bg-slate-50/90 px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${mobileGridClass[view]}`}
    >
      <span>{SQUAD_POSITION_LABELS[position]}</span>
      {view === "stats" ? (
        <>
          <span className="text-center">PJ</span>
          <span className="text-center" aria-label="Goles">⚽</span>
          <span className="text-center" aria-label="Asistencias">A</span>
          <span className="text-center" aria-label="Tarjetas amarillas">🟨</span>
          <span className="text-center" aria-label="Tarjetas rojas">🟥</span>
        </>
      ) : (
        <>
          <span className="text-center">Edad</span>
          <span className="text-center">€</span>
          <span className="text-center">Contrato</span>
        </>
      )}
    </div>
  );
}

function MobileValue({
  children,
  warn = false,
  compact = false,
}: {
  children: ReactNode;
  warn?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`min-w-0 truncate text-center font-bold tabular-nums ${
        compact ? "text-[9.5px]" : "text-[10.5px]"
      } ${warn ? "text-red-600" : "text-slate-700"}`}
    >
      {children}
    </span>
  );
}
