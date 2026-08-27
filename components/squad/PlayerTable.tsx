"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { SquadPlayer, SquadPosition } from "@/types/squad";
import { SQUAD_POSITIONS, SQUAD_ROLE_CODES, SQUAD_SECTION_LABELS, SQUAD_SECTIONS } from "@/types/squad";
import type { SquadRoleCode, SquadSection } from "@/types/squad";
import {
  formatContractDate,
  formatPlayerAge,
  getPlayerFullName,
  groupPlayersBySquadSection,
} from "@/lib/squad-utils";
import { PositionSection } from "@/components/squad/PositionSection";
import { SquadListColGroup } from "@/components/squad/SquadListColGroup";
import { SquadPlayerQuickEdit } from "@/components/squad/SquadPlayerQuickEdit";
import { formatFanRating } from "@/lib/format-fan-rating";
import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";

type PlayerTableProps = {
  players: SquadPlayer[];
  onSelect?: (player: SquadPlayer) => void;
  showMarketValue?: boolean;
  showAge?: boolean;
  showFanRating?: boolean;
  showEmptyPositions?: boolean;
  editMode?: boolean;
  /** Edición inline de posición y estadísticas (plantilla femenina). */
  inlineStatsEdit?: boolean;
  fanRatings?: Record<string, PlayerRatingAverage>;
  onQuickUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
};

type SquadStatKey = "partidos" | "goles" | "asistencias" | "amarillas" | "rojas";

const statInputClass =
  "w-full min-w-[2.25rem] max-w-[3.5rem] rounded-md border border-[#214C9B]/25 bg-white px-1 py-0.5 text-center text-sm font-semibold text-slate-800 focus:border-[#214C9B] focus:outline-none focus:ring-1 focus:ring-[#214C9B]/30";

const inlineFieldClass =
  "min-w-0 rounded-md border border-[#214C9B]/25 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800 focus:border-[#214C9B] focus:outline-none focus:ring-1 focus:ring-[#214C9B]/30";

function parseStatValue(raw: string): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
};

const cellPad = "px-4 py-3";
type MobileDataView = "stats" | "info";

const mobileGridClass = {
  stats: "grid-cols-[minmax(7.25rem,1fr)_repeat(6,minmax(1.75rem,2rem))]",
  info: "grid-cols-[minmax(7.25rem,1fr)_repeat(3,minmax(2.75rem,3.25rem))]",
};

export function PlayerTable({
  players,
  onSelect,
  showMarketValue = false,
  showAge = true,
  showFanRating = false,
  showEmptyPositions = false,
  editMode = false,
  inlineStatsEdit = false,
  fanRatings,
  onQuickUpdate,
}: PlayerTableProps) {
  const [mobileDataView, setMobileDataView] = useState<MobileDataView>("stats");
  const grouped = groupPlayersBySquadSection(players);

  const columns = [
    { key: "jugador", label: "Jugador", align: "left" as const },
    { key: "pos", label: "Pos.", align: "center" as const },
    ...(showAge ? [{ key: "edad", label: "Edad", align: "center" as const }] : []),
    { key: "pj", label: "PJ", align: "center" as const },
    { key: "g", label: "G", align: "center" as const },
    { key: "a", label: "A", align: "center" as const },
    { key: "ta", label: "TA", align: "center" as const },
    { key: "tr", label: "TR", align: "center" as const },
    ...(showFanRating ? [{ key: "nota", label: "Nota", align: "center" as const }] : []),
    ...(showMarketValue
      ? [
          { key: "valor", label: "Valor", align: "center" as const },
          { key: "contrato", label: "Contrato", align: "center" as const },
        ]
      : [{ key: "contrato", label: "Contrato", align: "center" as const }]),
  ];

  return (
    <div className="space-y-5 md:space-y-10">
      {inlineStatsEdit && editMode ? (
        <p className="text-sm text-slate-600">
          <span className="text-[#981915]">Edita dorsal, nombre, posición y estadísticas directamente en la tabla.</span>
        </p>
      ) : null}
      <MobileDataToggle value={mobileDataView} onChange={setMobileDataView} />
      {SQUAD_SECTIONS.map((section, sectionIndex) => {
        const list = grouped[section];
        if (list.length === 0 && !showEmptyPositions) return null;

        return (
          <PositionSection key={section} section={section} delay={sectionIndex * 0.04} hideHeadingOnMobile>
            <div className="overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)] md:rounded-[1.5rem]">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] table-fixed border-collapse">
                  <SquadListColGroup
                    variant="primer-equipo"
                    showAge={showAge}
                    showMarketValue={showMarketValue}
                    showFanRating={showFanRating}
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
                          showFanRating={showFanRating}
                          fanRating={fanRatings?.[player.id]}
                          editMode={editMode}
                          inlineStatsEdit={inlineStatsEdit}
                          onQuickUpdate={onQuickUpdate}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                <MobileSectionHeader
                  section={section}
                  view={mobileDataView}
                  showFanRating={showFanRating}
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
                      showFanRating={showFanRating}
                      fanRating={fanRatings?.[player.id]}
                      editMode={editMode}
                      inlineStatsEdit={inlineStatsEdit}
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

function squadTableColumnCount(showAge: boolean, showMarketValue: boolean, showFanRating: boolean) {
  return 2 + 1 + (showAge ? 1 : 0) + 5 + (showFanRating ? 1 : 0) + (showMarketValue ? 1 : 0) + 1;
}

function PlayerRow({
  player,
  onSelect,
  index,
  showMarketValue,
  showAge,
  showFanRating,
  fanRating,
  editMode,
  inlineStatsEdit,
  onQuickUpdate,
}: {
  player: SquadPlayer;
  onSelect?: (player: SquadPlayer) => void;
  index: number;
  showMarketValue: boolean;
  showAge: boolean;
  showFanRating: boolean;
  fanRating?: PlayerRatingAverage;
  editMode?: boolean;
  inlineStatsEdit?: boolean;
  onQuickUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
}) {
  const interactive = Boolean(onSelect);
  const canInlineEdit = inlineStatsEdit && editMode && onQuickUpdate;
  const canQuickEdit = !inlineStatsEdit && editMode && onQuickUpdate;
  const columnCount = squadTableColumnCount(showAge, showMarketValue, showFanRating);
  const update = (patch: Partial<SquadPlayer>) => onQuickUpdate?.(player.id, patch);
  const stop = (event: React.SyntheticEvent) => event.stopPropagation();

  if (canInlineEdit) {
    return (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.02 }}
        className="border-b border-slate-50 bg-[#214C9B]/[0.03] text-sm last:border-0"
        onClick={stop}
        onKeyDown={stop}
      >
        <td className={`${cellPad} ${alignClass.center}`}>
          <input
            type="number"
            min={0}
            value={player.dorsal}
            onChange={(event) => update({ dorsal: Number(event.target.value) || 0 })}
            className={`${statInputClass} font-extrabold text-[#214C9B]`}
            aria-label="Dorsal"
          />
        </td>
        <td className={`max-w-[11.5rem] ${cellPad} ${alignClass.left}`}>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="grid grid-cols-2 gap-1">
              <input
                value={player.nombre}
                onChange={(event) => update({ nombre: event.target.value })}
                placeholder="Nombre"
                className={inlineFieldClass}
                aria-label="Nombre"
              />
              <input
                value={player.apellido}
                onChange={(event) => update({ apellido: event.target.value })}
                placeholder="Apellido"
                className={inlineFieldClass}
                aria-label="Apellido"
              />
            </div>
            <select
              value={player.posicion}
              onChange={(event) => update({ posicion: event.target.value as SquadPosition })}
              className={`${inlineFieldClass} text-[10px] font-bold uppercase`}
              aria-label="Demarcación"
            >
              {SQUAD_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </td>
        <td className={`${cellPad} ${alignClass.center}`}>
          <select
            value={player.rol}
            onChange={(event) => update({ rol: event.target.value as SquadRoleCode })}
            className={`${inlineFieldClass} text-[10px] font-bold uppercase`}
            aria-label="Posición"
          >
            {SQUAD_ROLE_CODES.map((rol) => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>
        </td>
        {showAge && (
          <td className={`${cellPad} tabular-nums text-slate-700 ${alignClass.center}`}>
            {formatPlayerAge(player.edad)}
          </td>
        )}
        <EditableStatCell
          value={player.partidos}
          onChange={(value) => update({ partidos: value })}
        />
        <EditableStatCell
          value={player.goles}
          highlight={player.goles > 0}
          onChange={(value) => update({ goles: value })}
        />
        <EditableStatCell
          value={player.asistencias}
          highlight={player.asistencias > 0}
          onChange={(value) => update({ asistencias: value })}
        />
        <EditableStatCell
          value={player.amarillas}
          warn={player.amarillas > 0}
          onChange={(value) => update({ amarillas: value })}
        />
        <EditableStatCell
          value={player.rojas}
          warn={player.rojas > 0}
          onChange={(value) => update({ rojas: value })}
        />
        {showFanRating && (
          <td className={`${cellPad} text-center text-xs font-extrabold tabular-nums text-[#214C9B] ${alignClass.center}`}>
            {fanRating ? formatFanRating(fanRating.average) : "—"}
          </td>
        )}
        {showMarketValue && (
          <td className={`${cellPad} text-[10px] font-bold leading-tight tabular-nums text-slate-600 ${alignClass.center}`}>
            {player.valorMercado ?? "—"}
          </td>
        )}
        <td className={`${cellPad} ${alignClass.center}`}>
          <input
            type="date"
            value={player.contratoHasta}
            onChange={(event) => update({ contratoHasta: event.target.value })}
            className={`${inlineFieldClass} max-w-[7.5rem] text-[10px]`}
            aria-label="Contrato"
          />
        </td>
      </motion.tr>
    );
  }

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
      {showFanRating && (
        <td className={`${cellPad} text-center text-xs font-extrabold tabular-nums text-[#214C9B] ${alignClass.center}`}>
          {fanRating ? formatFanRating(fanRating.average) : "—"}
        </td>
      )}
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
  showFanRating,
  fanRating,
  editMode,
  inlineStatsEdit,
  onQuickUpdate,
}: {
  player: SquadPlayer;
  onSelect?: (player: SquadPlayer) => void;
  index: number;
  view: MobileDataView;
  showFanRating: boolean;
  fanRating?: PlayerRatingAverage;
  editMode?: boolean;
  inlineStatsEdit?: boolean;
  onQuickUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
}) {
  const canInlineEdit = inlineStatsEdit && editMode && onQuickUpdate;
  const canQuickEdit = !inlineStatsEdit && editMode && onQuickUpdate;
  const update = (patch: Partial<SquadPlayer>) => onQuickUpdate?.(player.id, patch);

  if (canInlineEdit) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="space-y-2 border-b border-slate-100 bg-[#214C9B]/[0.03] p-4"
      >
        <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-1.5">
          <input
            type="number"
            min={0}
            value={player.dorsal}
            onChange={(event) => update({ dorsal: Number(event.target.value) || 0 })}
            className={`${statInputClass} font-extrabold text-[#214C9B]`}
            aria-label="Dorsal"
          />
          <input
            value={player.nombre}
            onChange={(event) => update({ nombre: event.target.value })}
            placeholder="Nombre"
            className={inlineFieldClass}
            aria-label="Nombre"
          />
          <input
            value={player.apellido}
            onChange={(event) => update({ apellido: event.target.value })}
            placeholder="Apellido"
            className={inlineFieldClass}
            aria-label="Apellido"
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <select
            value={player.posicion}
            onChange={(event) => update({ posicion: event.target.value as SquadPosition })}
            className={`${inlineFieldClass} text-[10px] font-bold uppercase`}
            aria-label="Demarcación"
          >
            {SQUAD_POSITIONS.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <select
            value={player.rol}
            onChange={(event) => update({ rol: event.target.value as SquadRoleCode })}
            className={`${inlineFieldClass} text-[10px] font-bold uppercase`}
            aria-label="Posición"
          >
            {SQUAD_ROLE_CODES.map((rol) => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {(["partidos", "goles", "asistencias", "amarillas", "rojas"] as SquadStatKey[]).map((key) => (
            <label key={key} className="text-center">
              <span className="text-[9px] font-bold uppercase text-slate-400">
                {key === "partidos" ? "PJ" : key === "goles" ? "G" : key === "asistencias" ? "A" : key === "amarillas" ? "TA" : "TR"}
              </span>
              <input
                type="number"
                min={0}
                value={player[key]}
                onChange={(event) => update({ [key]: parseStatValue(event.target.value) })}
                className={`${statInputClass} mt-0.5`}
                aria-label={key}
              />
            </label>
          ))}
        </div>
        <input
          type="date"
          value={player.contratoHasta}
          onChange={(event) => update({ contratoHasta: event.target.value })}
          className={`${inlineFieldClass} w-full text-[10px]`}
          aria-label="Contrato"
        />
      </motion.div>
    );
  }

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
          {showFanRating ? (
            <MobileValue highlight={Boolean(fanRating)}>
              {fanRating ? formatFanRating(fanRating.average) : "—"}
            </MobileValue>
          ) : null}
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

function EditableStatCell({
  value,
  highlight = false,
  warn = false,
  onChange,
}: {
  value: number;
  highlight?: boolean;
  warn?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <td className={`${cellPad} ${alignClass.center}`}>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(parseStatValue(event.target.value))}
        className={`${statInputClass} font-extrabold ${
          warn && value > 0 ? "text-red-600" : highlight ? "text-[#214C9B]" : "text-slate-700"
        }`}
        aria-label="Estadística"
      />
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
  section,
  view,
  showFanRating,
}: {
  section: SquadSection;
  view: MobileDataView;
  showFanRating: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-1.5 border-b border-slate-100 bg-slate-50/90 px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${mobileGridClass[view]}`}
    >
      <span>{SQUAD_SECTION_LABELS[section]}</span>
      {view === "stats" ? (
        <>
          <span className="text-center">PJ</span>
          <span className="text-center" aria-label="Goles">⚽</span>
          <span className="text-center" aria-label="Asistencias">A</span>
          <span className="text-center" aria-label="Tarjetas amarillas">🟨</span>
          <span className="text-center" aria-label="Tarjetas rojas">🟥</span>
          {showFanRating ? <span className="text-center">Nota</span> : null}
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
