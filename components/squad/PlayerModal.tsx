"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, Ruler, Scale, X } from "lucide-react";
import type { SquadModalTab, SquadPlayer } from "@/types/squad";
import { formatBirthDate, formatContractDate, getPlayerFullName } from "@/lib/squad-utils";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { PlayerStats } from "@/components/squad/PlayerStats";
import { PlayerMatchesTable } from "@/components/squad/PlayerMatchesTable";
import { PlayerCareerTimeline } from "@/components/squad/PlayerCareerTimeline";

const tabs: Array<{ id: SquadModalTab; label: string }> = [
  { id: "resumen", label: "Resumen" },
  { id: "partidos", label: "Partidos" },
  { id: "estadisticas", label: "Estadisticas" },
  { id: "trayectoria", label: "Trayectoria" },
];

type PlayerModalProps = {
  player: SquadPlayer | null;
  onClose: () => void;
};

function PlayerModalContent({ player, onClose }: { player: SquadPlayer; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<SquadModalTab>("resumen");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      onClick={(event) => event.stopPropagation()}
      className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[2rem] border border-[#214C9B]/20 bg-white shadow-2xl sm:rounded-[2rem]"
    >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2347] via-[#173a78] to-[#214C9B] px-5 pb-6 pt-5 text-white sm:px-8 sm:pb-8 sm:pt-6">
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
                    {player.posicion}
                  </span>
                  <h2 className="mt-3 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{getPlayerFullName(player)}</h2>
                  <p className="mt-2 text-sm font-semibold text-white/80">
                    {player.nacionalidad} · {player.edad} anos
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs font-semibold sm:grid-cols-3">
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

            <div className="border-b border-slate-200 px-4 sm:px-6">
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

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                >
                  {activeTab === "resumen" && (
                    <div className="space-y-6">
                      <PlayerStats player={player} />
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Perfil</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          Jugador del {player.posicion.toLowerCase()} con presencia en la plantilla del Real Aviles Industrial. Datos
                          mock preparados para integracion con API oficial.
                        </p>
                      </div>
                    </div>
                  )}
                  {activeTab === "partidos" && <PlayerMatchesTable player={player} />}
                  {activeTab === "estadisticas" && (
                    <div className="space-y-6">
                      <PlayerStats player={player} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DetailStat label="Promedio minutos/partido" value={`${Math.round(player.minutos / Math.max(player.partidos, 1))} min`} />
                        <DetailStat label="Contribucion ofensiva" value={`${player.goles + player.asistencias} G+A`} />
                        <DetailStat label="Tarjetas totales" value={String(player.amarillas + player.rojas)} />
                        <DetailStat label="xG acumulado" value={player.xG.toFixed(2)} />
                      </div>
                    </div>
                  )}
                  {activeTab === "trayectoria" && <PlayerCareerTimeline player={player} />}
                </motion.div>
              </AnimatePresence>
            </div>
    </motion.div>
  );
}

export function PlayerModal({ player, onClose }: PlayerModalProps) {
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
          <PlayerModalContent key={player.id} player={player} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
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
