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

type PlayerTableProps = {
  players: SquadPlayer[];
  onSelect?: (player: SquadPlayer) => void;
  showMarketValue?: boolean;
};

const baseColumns = [
  { key: "jugador", label: "Jugador", align: "left" as const },
  { key: "pos", label: "Pos.", align: "center" as const },
  { key: "edad", label: "Edad", align: "center" as const },
  { key: "pj", label: "PJ", align: "center" as const },
  { key: "g", label: "G", align: "center" as const },
  { key: "a", label: "A", align: "center" as const },
  { key: "ta", label: "TA", align: "center" as const },
  { key: "tr", label: "TR", align: "center" as const },
  { key: "contrato", label: "Contrato", align: "center" as const },
] as const;

const marketValueColumn = { key: "valor", label: "Valor", align: "center" as const };

const alignClass = {
  left: "text-left",
  center: "text-center",
};

export function PlayerTable({ players, onSelect, showMarketValue = false }: PlayerTableProps) {
  const grouped = groupPlayersByPosition(players);
  const columns = showMarketValue
    ? [...baseColumns.slice(0, -1), marketValueColumn, baseColumns[baseColumns.length - 1]]
    : [...baseColumns];

  return (
    <div className="space-y-10">
      {SQUAD_POSITIONS.map((position, sectionIndex) => {
        const list = grouped[position];
        if (list.length === 0) return null;

        return (
          <PositionSection key={position} position={position} delay={sectionIndex * 0.04}>
            <div className="overflow-hidden rounded-[1.5rem] border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] table-fixed border-collapse">
                  <colgroup>
                    <col className="w-12" />
                    <col className="w-[11.5rem]" />
                    <col className="w-12" />
                    <col className="w-14" />
                    <col className="w-12" />
                    <col className="w-12" />
                    <col className="w-12" />
                    <col className="w-12" />
                    <col className="w-12" />
                    {showMarketValue && <col className="w-[4.25rem]" />}
                    <col className="w-16" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className={`px-5 py-4 ${alignClass.center}`}>#</th>
                      {columns.map((col) => (
                        <th key={col.label} className={`px-4 py-4 ${alignClass[col.align]}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((player, rowIndex) => (
                      <PlayerRow
                        key={player.id}
                        player={player}
                        onSelect={onSelect}
                        index={rowIndex}
                        showMarketValue={showMarketValue}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {list.map((player, rowIndex) => (
                  <PlayerMobileRow
                    key={player.id}
                    player={player}
                    onSelect={onSelect}
                    index={rowIndex}
                    showMarketValue={showMarketValue}
                  />
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
  showMarketValue,
}: {
  player: SquadPlayer;
  onSelect?: (player: SquadPlayer) => void;
  index: number;
  showMarketValue: boolean;
}) {
  const interactive = Boolean(onSelect);

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
      <td className={`px-3 py-3 font-extrabold tabular-nums text-[#214C9B] ${alignClass.center}`}>{player.dorsal}</td>
      <td className={`max-w-[11.5rem] px-3 py-3 ${alignClass.left}`}>
        <p className="truncate text-sm font-extrabold uppercase text-slate-900">{getPlayerFullName(player)}</p>
      </td>
      <td className={`px-2 py-3 text-xs font-extrabold tracking-wide text-slate-600 ${alignClass.center}`}>{player.rol}</td>
      <td className={`px-4 py-4 tabular-nums text-slate-700 ${alignClass.center}`}>
        {formatPlayerAge(player.edad)}
      </td>
      <StatCell value={player.partidos} />
      <StatCell value={player.goles} highlight={player.goles > 0} />
      <StatCell value={player.asistencias} highlight={player.asistencias > 0} />
      <StatCell value={player.amarillas} warn={player.amarillas > 0} />
      <StatCell value={player.rojas} warn={player.rojas > 0} />
      {showMarketValue && (
        <td className={`px-1.5 py-3 text-[10px] font-bold leading-tight tabular-nums text-slate-600 ${alignClass.center}`}>
          {player.valorMercado ?? "—"}
        </td>
      )}
      <td className={`px-4 py-4 text-xs font-bold tabular-nums text-slate-500 ${alignClass.center}`}>
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
}: {
  player: SquadPlayer;
  onSelect?: (player: SquadPlayer) => void;
  index: number;
  showMarketValue: boolean;
}) {
  const content = (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="text-lg font-extrabold text-[#214C9B]">#{player.dorsal}</span>
        <p className="truncate font-extrabold uppercase text-slate-900">{getPlayerFullName(player)}</p>
      </div>
      <p className="text-xs font-semibold text-slate-500">
        {player.rol} · {formatPlayerAgeWithUnit(player.edad)}
      </p>
      <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
        {showMarketValue && player.valorMercado && (
          <span className="rounded-lg bg-blue-50 px-2 py-1 text-[#214C9B]">{player.valorMercado}</span>
        )}
        <span className="rounded-lg bg-slate-100 px-2 py-1">PJ {player.partidos}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1">G {player.goles}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1">A {player.asistencias}</span>
      </div>
    </div>
  );

  if (!onSelect) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="flex w-full items-center gap-3 p-4"
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
      className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-blue-50/70"
    >
      {content}
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
