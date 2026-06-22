"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, ChevronUp, MapPin, Ruler, Scale, Star, X } from "lucide-react";
import type { PlayerCareerRecord, SquadModalTab, SquadPlayer } from "@/types/squad";
import { SQUAD_POSITIONS, SQUAD_ROLE_CODES } from "@/types/squad";
import { ageFromBirthDate } from "@/lib/squad-age";
import { parseCareerJson } from "@/lib/career-utils";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import {
  formatBirthDate,
  formatContractDate,
  formatPlayerAgeWithUnit,
  getPlayerFullName,
} from "@/lib/squad-utils";
import { getTransferKind, getTransferClubAnnouncementNews } from "@/lib/fichajes";
import { clubAnnouncementFromTransfer } from "@/lib/club-announcement";
import { useTransfers } from "@/hooks/useTransfers";
import { formatFanRating } from "@/lib/format-fan-rating";
import { usePublishedNews } from "@/hooks/usePublishedNews";
import { useSeasonPlayerRatings } from "@/hooks/useSeasonPlayerRatings";
import { getPlayerClubAnnouncementNews } from "@/lib/player-news";
import { defaultSquadPlayerPhotoPath } from "@/lib/squad-photos";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { PlayerStats } from "@/components/squad/PlayerStats";
import { PlayerMatchesTable } from "@/components/squad/PlayerMatchesTable";
import { PlayerCareerTimeline } from "@/components/squad/PlayerCareerTimeline";
import { PlayerActualidadSection } from "@/components/squad/PlayerActualidadSection";
import { PlayerResumenSection } from "@/components/squad/PlayerResumenSection";
import {
  PlayerAvailabilityPanel,
  SQUAD_ROSTER_ESTADOS,
} from "@/components/squad/PlayerAvailabilityPanel";

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
  onRemove?: (playerId: string) => void;
};

function PlayerModalContent({
  player,
  onClose,
  onUpdate,
  onRemove,
}: {
  player: SquadPlayer;
  onClose: () => void;
  onUpdate?: (playerId: string, patch: Partial<SquadPlayer>) => void;
  onRemove?: (playerId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<SquadModalTab>("actualidad");
  const { editMode } = useInlineEditing();
  const { averages } = useSeasonPlayerRatings();
  const { items: allNews } = usePublishedNews();
  const fanRating = averages[player.id] ?? null;
  const playerName = getPlayerFullName(player);
  const { getForPlayer } = useTransfers();
  const transfer = getForPlayer(player.id);

  const { clubAnnouncementNews, hasSigningChronicle } = useMemo(() => {
    const announcementNews = transfer
      ? getTransferClubAnnouncementNews(transfer, allNews)
      : getPlayerClubAnnouncementNews(allNews, player.id, { playerName });

    const kind = transfer ? getTransferKind(transfer) : null;
    const fromTransfer = kind === "fichaje" || kind === "renovacion" || kind === "cesion";
    const fromNews = Boolean(
      announcementNews &&
        (announcementNews.tags.includes("fichajes") || announcementNews.tags.includes("renovaciones")),
    );

    return {
      clubAnnouncementNews: announcementNews,
      hasSigningChronicle: fromTransfer || fromNews,
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
            <PlayerAvatar
              player={player}
              size="xl"
              priority
              className="aspect-[4/5] w-full rounded-[1.5rem] shadow-2xl"
            />
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
                value={fanRating ? formatFanRating(fanRating.average) : "Sin valoraciones"}
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
        <PlayerAvailabilityPanel
          player={player}
          editMode={editMode}
          onUpdate={onUpdate ? (patch) => onUpdate(player.id, patch) : undefined}
        />
        {editMode && onUpdate && (
          <PlayerInlineEditor
            player={player}
            onUpdate={(patch) => onUpdate(player.id, patch)}
            onRemove={onRemove ? () => onRemove(player.id) : undefined}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === "actualidad" &&
              (hasSigningChronicle ? (
                <PlayerActualidadSection
                  clubAnnouncement={clubAnnouncementFromTransfer(transfer, clubAnnouncementNews)}
                  transfer={transfer}
                />
              ) : (
                <p className="text-sm text-slate-500">Sin crónica de fichaje o renovación para este jugador.</p>
              ))}
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

export function PlayerModal({ player, onClose, onUpdate, onRemove }: PlayerModalProps) {
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
          <PlayerModalContent
            key={player.id}
            player={player}
            onClose={onClose}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerInlineEditor({
  player,
  onUpdate,
  onRemove,
}: {
  player: SquadPlayer;
  onUpdate: (patch: Partial<SquadPlayer>) => void;
  onRemove?: () => void;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-[#214C9B]/20 bg-blue-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">Editar ficha</p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-[#981915]/30 px-3 py-1 text-[10px] font-extrabold uppercase text-[#981915] hover:bg-red-50"
          >
            Eliminar jugador
          </button>
        )}
      </div>
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
        <EditorSelect
          label="Estado"
          value={SQUAD_ROSTER_ESTADOS.includes(player.estado) ? player.estado : "titular"}
          options={SQUAD_ROSTER_ESTADOS}
          onChange={(value) => onUpdate({ estado: value })}
        />
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
        <EditorInput
          label="Foto (ruta)"
          value={player.foto ?? ""}
          placeholder={defaultSquadPlayerPhotoPath(player.dorsal) ?? "/Jugadores/1.webp"}
          onChange={(value) => onUpdate({ foto: value.trim() || null })}
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
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
  const [showJsonPaste, setShowJsonPaste] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const updateRow = (index: number, patch: Partial<PlayerCareerRecord>) => {
    onChange(trayectoria.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const addRow = (position: "start" | "end") => {
    const row: PlayerCareerRecord = {
      temporada: position === "start" ? "2020/21" : "2025/26",
      club: "",
      partidos: 0,
      goles: 0,
      asistencias: 0,
    };
    onChange(position === "start" ? [row, ...trayectoria] : [...trayectoria, row]);
  };

  const removeRow = (index: number) => {
    onChange(trayectoria.filter((_, rowIndex) => rowIndex !== index));
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= trayectoria.length) return;
    const next = [...trayectoria];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next);
  };

  const openJsonPaste = () => {
    setJsonDraft(JSON.stringify(trayectoria, null, 2));
    setJsonError(null);
    setShowJsonPaste(true);
  };

  const closeJsonPaste = () => {
    setShowJsonPaste(false);
    setJsonError(null);
  };

  const applyJsonPaste = () => {
    const result = parseCareerJson(jsonDraft);
    if (!result.ok) {
      setJsonError(result.error);
      return;
    }
    setJsonError(null);
    onChange(result.records);
    setShowJsonPaste(false);
    setJsonDraft("");
  };

  return (
    <section className="mb-6 rounded-2xl border border-[#214C9B]/20 bg-blue-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">Editar trayectoria</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openJsonPaste}
            className="rounded-full border border-[#214C9B]/25 px-3 py-1 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-white"
          >
            Pegar JSON
          </button>
          <button
            type="button"
            onClick={() => addRow("start")}
            className="rounded-full border border-[#214C9B]/25 px-3 py-1 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-white"
          >
            Temporada anterior
          </button>
          <button
            type="button"
            onClick={() => addRow("end")}
            className="rounded-full border border-[#214C9B]/25 px-3 py-1 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-white"
          >
            Temporada reciente
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-500">
        Orden de más antigua a más reciente. Usa las flechas para reordenar o pega un array JSON.
      </p>
      {showJsonPaste && (
        <div className="mt-3 rounded-xl border border-[#214C9B]/20 bg-white p-3">
          <p className="text-[11px] font-semibold text-slate-600">
            Pega un array con <code className="font-mono text-[10px]">temporada</code>,{" "}
            <code className="font-mono text-[10px]">club</code>,{" "}
            <code className="font-mono text-[10px]">partidos</code>,{" "}
            <code className="font-mono text-[10px]">goles</code> y{" "}
            <code className="font-mono text-[10px]">asistencias</code>.
          </p>
          <textarea
            value={jsonDraft}
            onChange={(event) => {
              setJsonDraft(event.target.value);
              if (jsonError) setJsonError(null);
            }}
            spellCheck={false}
            className="mt-2 min-h-[10rem] w-full resize-y rounded-xl border border-[#214C9B]/20 bg-slate-50 px-3 py-2 font-mono text-xs leading-5 text-slate-800 outline-none focus:border-[#214C9B]"
            placeholder={`[\n  {\n    "temporada": "2024/25",\n    "club": "Real Avilés C.F.",\n    "partidos": 30,\n    "goles": 1,\n    "asistencias": 0\n  }\n]`}
          />
          {jsonError && <p className="mt-2 text-xs font-semibold text-[#981915]">{jsonError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyJsonPaste}
              className="rounded-full bg-[#214C9B] px-4 py-1.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78]"
            >
              Aplicar JSON
            </button>
            <button
              type="button"
              onClick={closeJsonPaste}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div className="mt-3 space-y-3">
        {trayectoria.map((row, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-xl border border-[#214C9B]/15 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[auto_repeat(5,minmax(0,1fr))]"
          >
            <div className="flex items-end gap-1 sm:col-span-2 lg:col-span-1">
              <button
                type="button"
                onClick={() => moveRow(index, -1)}
                disabled={index === 0}
                className="rounded-lg border border-[#214C9B]/20 p-2 text-[#214C9B] hover:bg-blue-50 disabled:opacity-30"
                aria-label="Subir temporada"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => moveRow(index, 1)}
                disabled={index === trayectoria.length - 1}
                className="rounded-lg border border-[#214C9B]/20 p-2 text-[#214C9B] hover:bg-blue-50 disabled:opacity-30"
                aria-label="Bajar temporada"
              >
                <ChevronDown size={16} />
              </button>
            </div>
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
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
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
          <p className="text-sm text-slate-600">Sin equipos en la trayectoria. Añade una temporada.</p>
        )}
      </div>
    </section>
  );
}
