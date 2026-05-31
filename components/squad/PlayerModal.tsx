"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, Ruler, Scale, Star, X } from "lucide-react";
import type { PlayerCareerRecord, SquadModalTab, SquadPlayer } from "@/types/squad";
import { SQUAD_POSITIONS, SQUAD_ROLE_CODES } from "@/types/squad";
import { ageFromBirthDate } from "@/lib/squad-age";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import {
  formatBirthDate,
  formatContractDate,
  formatPlayerAgeWithUnit,
  getPlayerFullName,
} from "@/lib/squad-utils";
import { getTransferForPlayer, getTransferKind } from "@/lib/fichajes";
import { formatFanRating } from "@/lib/format-fan-rating";
import { usePublishedNews } from "@/hooks/usePublishedNews";
import { useSeasonPlayerRatings } from "@/hooks/useSeasonPlayerRatings";
import { getPlayerClubAnnouncementNews, getPlayerNews } from "@/lib/player-news";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { PlayerStats } from "@/components/squad/PlayerStats";
import { PlayerMatchesTable } from "@/components/squad/PlayerMatchesTable";
import { PlayerCareerTimeline } from "@/components/squad/PlayerCareerTimeline";
import { PlayerActualidadSection } from "@/components/squad/PlayerActualidadSection";
import { PlayerResumenSection } from "@/components/squad/PlayerResumenSection";

const tabs: Array<{ id: SquadModalTab; label: string }> = [
  { id: "actualidad", label: "Actualidad" },
  { id: "resumen", label: "Resumen" },
  { id: "partidos", label: "Partidos" },
  { id: "estadisticas", label: "Estadisticas" },
  { id: "trayectoria", label: "Trayectoria" },
];

type PlayerModalProps = {
  player: SquadPlayer | null;
  onClose: () => void;
  onUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
};

function PlayerModalContent({
  player,
  onClose,
  onUpdate,
}: {
  player: SquadPlayer;
  onClose: () => void;
  onUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
}) {
  const [activeTab, setActiveTab] = useState<SquadModalTab>("actualidad");
  const { editMode } = useInlineEditing();
  const { averages } = useSeasonPlayerRatings();
  const { items: allNews } = usePublishedNews();
  const fanRating = averages[player.id] ?? null;
  const playerName = getPlayerFullName(player);
  const transfer = getTransferForPlayer(player.id);

  const { clubAnnouncementNews, playerNews, announcementTone } = useMemo(() => {
    const announcementNews = getPlayerClubAnnouncementNews(allNews, player.id, {
      announcementNewsId: transfer?.clubAnnouncementNewsId,
      playerName,
    });
    const news = getPlayerNews(allNews, player.id, {
      excludeNewsId: announcementNews?.id,
      playerName,
    });
    const kind = transfer ? getTransferKind(transfer) : null;
    const tone =
      kind === "renovacion" ? "renovacion" : kind === "cesion" ? "fichaje" : kind === "fichaje" ? "fichaje" : "default";

    return {
      clubAnnouncementNews: announcementNews,
      playerNews: news,
      announcementTone: tone as "fichaje" | "renovacion" | "default",
    };
  }, [allNews, player.id, playerName, transfer]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      onClick={(event) => event.stopPropagation()}
      className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[2rem] border border-[#214C9B]/20 bg-white shadow-2xl sm:rounded-[2rem]"
    >
      <div className="relative z-20 shrink-0 overflow-hidden bg-gradient-to-br from-[#0f2347] via-[#173a78] to-[#214C9B] px-5 pb-6 pt-5 text-white sm:px-8 sm:pb-8 sm:pt-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/20"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="relative mx-auto w-[58%] max-w-[220px] sm:mx-0 sm:w-[200px]">
            <PlayerAvatar player={player} size="xl" className="aspect-[4/5] h-auto w-full rounded-[1.5rem] shadow-2xl" />
            <div className="absolute -bottom-3 -right-2 rounded-2xl bg-white px-4 py-2 text-4xl font-extrabold text-[#214C9B] shadow-xl">
              {player.dorsal}
            </div>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
              {player.rol}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{playerName}</h2>
            <p className="mt-2 text-sm font-semibold text-white/80">
              {player.nacionalidad} · {formatPlayerAgeWithUnit(player.edad)}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs font-semibold sm:grid-cols-3">
              {player.valorMercado && <InfoChip label="Valor mercado" value={player.valorMercado} />}
              <InfoChip
                icon={Star}
                label="Valoración media"
                value={
                  fanRating
                    ? `${formatFanRating(fanRating.average)} (${fanRating.count} partido${fanRating.count === 1 ? "" : "s"})`
                    : "Sin valoraciones"
                }
              />
              <InfoChip icon={Calendar} label="Nacimiento" value={formatBirthDate(player.fechaNacimiento)} />
              <InfoChip icon={MapPin} label="Lugar" value={player.lugarNacimiento} />
              <InfoChip icon={Ruler} label="Altura" value={player.altura} />
              <InfoChip icon={Scale} label="Peso" value={player.peso} />
              <InfoChip label="Pierna" value={player.piernaBuena} />
              <InfoChip label="Contrato" value={formatContractDate(player.contratoHasta)} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                activeTab === tab.id ? "text-[#214C9B]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="player-modal-tab"
                  className="absolute inset-0 rounded-xl bg-blue-50"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-0 min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {editMode && onUpdate && (
          <PlayerInlineEditor player={player} onUpdate={(patch) => onUpdate(player.id, patch)} />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === "actualidad" && (
              <PlayerActualidadSection
                clubAnnouncement={
                  transfer?.clubAnnouncement
                    ? {
                        text: transfer.clubAnnouncement,
                        date: transfer.date,
                        newsItem: clubAnnouncementNews,
                      }
                    : clubAnnouncementNews
                      ? {
                          text: clubAnnouncementNews.excerpt,
                          date: clubAnnouncementNews.date,
                          newsItem: clubAnnouncementNews,
                        }
                      : undefined
                }
                playerNews={playerNews}
                announcementTone={announcementTone}
              />
            )}
            {activeTab === "resumen" && <PlayerResumenSection player={player} fanRating={fanRating} />}
            {activeTab === "partidos" && <PlayerMatchesTable player={player} />}
            {activeTab === "estadisticas" && (
              <div className="space-y-6">
                <PlayerStats player={player} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailStat label="Promedio minutos/partido" value={`${Math.round(player.minutos / Math.max(player.partidos, 1))} min`} />
                  <DetailStat label="Contribucion ofensiva" value={`${player.goles + player.asistencias} G+A`} />
                  <DetailStat label="Tarjetas totales" value={String(player.amarillas + player.rojas)} />
                </div>
              </div>
            )}
            {activeTab === "trayectoria" && (
              <>
                {editMode && onUpdate && (
                  <PlayerCareerEditor
                    trayectoria={player.trayectoria}
                    onChange={(trayectoria) => onUpdate(player.id, { trayectoria })}
                  />
                )}
                <PlayerCareerTimeline player={player} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function PlayerModal({ player, onClose, onUpdate }: PlayerModalProps) {
  useEffect(() => {
    if (!player) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [player, onClose]);

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <PlayerModalContent key={player.id} player={player} onClose={onClose} onUpdate={onUpdate} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerInlineEditor({
  player,
  onUpdate,
}: {
  player: SquadPlayer;
  onUpdate: (patch: Partial<SquadPlayer>) => void;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-[#214C9B]/20 bg-blue-50/60 p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">Editar ficha</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EditorInput label="Nombre" value={player.nombre} onChange={(value) => onUpdate({ nombre: value })} />
        <EditorInput label="Apellido" value={player.apellido} onChange={(value) => onUpdate({ apellido: value })} />
        <EditorInput
          label="Dorsal"
          type="number"
          value={String(player.dorsal)}
          onChange={(value) => onUpdate({ dorsal: Number(value) || 0 })}
        />
        <EditorSelect label="Rol" value={player.rol} options={SQUAD_ROLE_CODES} onChange={(value) => onUpdate({ rol: value })} />
        <EditorSelect label="Posición" value={player.posicion} options={SQUAD_POSITIONS} onChange={(value) => onUpdate({ posicion: value })} />
        <EditorInput label="Nacionalidad" value={player.nacionalidad} onChange={(value) => onUpdate({ nacionalidad: value })} />
        <EditorInput label="Altura" value={player.altura} onChange={(value) => onUpdate({ altura: value })} />
        <EditorInput label="Peso" value={player.peso} onChange={(value) => onUpdate({ peso: value })} />
        <EditorSelect
          label="Pierna"
          value={player.piernaBuena}
          options={["Derecha", "Izquierda", "Ambidiestro"] as const}
          onChange={(value) => onUpdate({ piernaBuena: value })}
        />
        <EditorInput
          label="Fecha nacimiento"
          type="date"
          value={player.fechaNacimiento}
          onChange={(value) =>
            onUpdate({
              fechaNacimiento: value,
              edad: value ? ageFromBirthDate(value) : player.edad,
            })
          }
        />
        <EditorInput
          label="Lugar nacimiento"
          value={player.lugarNacimiento}
          onChange={(value) => onUpdate({ lugarNacimiento: value })}
        />
        <EditorInput
          label="Contrato"
          type="date"
          value={player.contratoHasta}
          onChange={(value) => onUpdate({ contratoHasta: value })}
        />
      </div>
      <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-slate-500">
        Descripción
        <textarea
          value={player.descripcion}
          onChange={(event) => onUpdate({ descripcion: event.target.value })}
          className="mt-1 min-h-[6rem] w-full resize-y rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-sm normal-case leading-6 text-slate-800 outline-none focus:border-[#214C9B]"
        />
      </label>
    </section>
  );
}

function EditorInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-sm normal-case text-slate-800 outline-none focus:border-[#214C9B]"
      />
    </label>
  );
}

function EditorSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-1 w-full rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-sm normal-case text-slate-800 outline-none focus:border-[#214C9B]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white/60">
        {Icon && <Icon size={12} />}
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#214C9B]">{value}</p>
    </div>
  );
}

function PlayerCareerEditor({
  trayectoria,
  onChange,
}: {
  trayectoria: PlayerCareerRecord[];
  onChange: (records: PlayerCareerRecord[]) => void;
}) {
  const updateRow = (index: number, patch: Partial<PlayerCareerRecord>) => {
    onChange(trayectoria.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    onChange([
      ...trayectoria,
      { temporada: "2025/26", club: "", partidos: 0, goles: 0, asistencias: 0 },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(trayectoria.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <section className="mb-6 rounded-2xl border border-[#214C9B]/20 bg-blue-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">Editar trayectoria</p>
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-[#214C9B]/25 px-3 py-1 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-white"
        >
          Añadir equipo
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {trayectoria.map((row, index) => (
          <div
            key={`${row.temporada}-${row.club}-${index}`}
            className="grid gap-2 rounded-xl border border-[#214C9B]/15 bg-white p-3 sm:grid-cols-2 lg:grid-cols-6"
          >
            <EditorInput label="Temporada" value={row.temporada} onChange={(value) => updateRow(index, { temporada: value })} />
            <EditorInput label="Equipo" value={row.club} onChange={(value) => updateRow(index, { club: value })} />
            <EditorInput
              label="PJ"
              type="number"
              value={String(row.partidos)}
              onChange={(value) => updateRow(index, { partidos: Number(value) || 0 })}
            />
            <EditorInput
              label="G"
              type="number"
              value={String(row.goles)}
              onChange={(value) => updateRow(index, { goles: Number(value) || 0 })}
            />
            <EditorInput
              label="A"
              type="number"
              value={String(row.asistencias)}
              onChange={(value) => updateRow(index, { asistencias: Number(value) || 0 })}
            />
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="w-full rounded-xl border border-[#981915]/25 px-3 py-2 text-xs font-extrabold uppercase text-[#981915] hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {trayectoria.length === 0 && (
          <p className="text-sm text-slate-600">Sin equipos en la trayectoria. Pulsa «Añadir equipo».</p>
        )}
      </div>
    </section>
  );
}
