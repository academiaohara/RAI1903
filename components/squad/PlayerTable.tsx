"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";
import {
  formatContractDate,
  formatPlayerAge,
  formatPlayerAgeWithUnit,
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

export function PlayerTable({
  players,
  onSelect,
  showMarketValue = false,
  showAge = true,
  showEmptyPositions = false,
  editMode = false,
  onQuickUpdate,
}: PlayerTableProps) {
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
    <div className="space-y-10">
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0 && !showEmptyPositions) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.04}>
            <div className="overflow-hidden rounded-[1.5rem] border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
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
                {list.length === 0 ? (
                  <p className="p-4 text-center text-sm font-semibold text-slate-400">Sin jugadores en esta posición</p>
                ) : (
                  list.map((player, rowIndex) => (
                    <PlayerMobileRow
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
  const canQuickEdit = editMode && onQuickUpdate;
  const metaParts: string[] = [player.rol];
  if (showAge) metaParts.push(formatPlayerAgeWithUnit(player.edad));

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

  const statLine = [
    `PJ${player.partidos}`,
    `G${player.goles}`,
    `A${player.asistencias}`,
    ...(showMarketValue && player.valorMercado ? [player.valorMercado] : []),
  ].join(" ");

  const content = (
    <>
      <span className="w-4 shrink-0 text-center text-[10px] font-extrabold tabular-nums text-[#214C9B] sm:w-5 sm:text-[11px]">{player.dorsal}</span>
      <span className="min-w-0 flex-1 truncate text-[10px] font-extrabold uppercase text-slate-900 sm:text-[11px]">{getPlayerFullName(player)}</span>
      <span className="hidden shrink-0 text-[10px] font-semibold text-slate-500 sm:inline">{metaParts.join(" · ")}</span>
      <span className="max-w-[6.75rem] shrink-0 truncate text-right text-[8.5px] font-bold tabular-nums text-slate-600 sm:max-w-none sm:text-[10px]">{statLine}</span>
    </>
  );

  const rowClassName =
    "flex w-full min-w-0 items-center gap-1.5 px-2 py-2 sm:gap-3 sm:p-4";

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
