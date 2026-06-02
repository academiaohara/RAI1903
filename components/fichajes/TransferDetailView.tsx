"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Calendar } from "lucide-react";
import { PlayerActualidadSection } from "@/components/squad/PlayerActualidadSection";
import { clubAnnouncementFromTransfer } from "@/lib/club-announcement";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { PlayerCareerTimeline } from "@/components/squad/PlayerCareerTimeline";
import { PlayerMatchesTable } from "@/components/squad/PlayerMatchesTable";
import { PlayerResumenSection } from "@/components/squad/PlayerResumenSection";
import { PlayerStats } from "@/components/squad/PlayerStats";
import {
  getTransferClubAnnouncementNews,
  getTransferDisplayName,
  getTransferKind,
  getTransferKindLabel,
  getTransferOriginClub,
  getTransferPlayerNews,
} from "@/lib/fichajes";
import { usePublishedNews } from "@/hooks/usePublishedNews";
import { useSeasonPlayerRatings } from "@/hooks/useSeasonPlayerRatings";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { formatBirthDate, formatContractDate, getNationalityFlag } from "@/lib/squad-utils";
import { formatDate } from "@/lib/utils";
import type { TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

type TransferDetailTab = "actualidad" | "resumen" | "partidos" | "estadisticas" | "trayectoria";

const allTabs: Array<{ id: TransferDetailTab; label: string; requiresPlayer?: boolean }> = [
  { id: "actualidad", label: "Actualidad" },
  { id: "resumen", label: "Resumen", requiresPlayer: true },
  { id: "partidos", label: "Partidos", requiresPlayer: true },
  { id: "estadisticas", label: "Estadisticas", requiresPlayer: true },
  { id: "trayectoria", label: "Trayectoria", requiresPlayer: true },
];

const toneByKind = {
  fichaje: {
    hero: "from-[#173a78] via-[#214C9B] to-[#2d6fd4]",
    chip: "border-white/25 bg-white/10",
    accent: "text-[#981915]",
    pill: "bg-[#981915]/10 text-[#981915]",
    announcement: "fichaje" as const,
  },
  renovacion: {
    hero: "from-[#0f2347] via-[#173a78] to-[#214C9B]",
    chip: "border-white/25 bg-white/10",
    accent: "text-[#214C9B]",
    pill: "bg-blue-50 text-[#214C9B]",
    announcement: "renovacion" as const,
  },
} as const;

type TransferDetailViewProps = {
  transfer: TransferRumor;
  player?: SquadPlayer;
};

export function TransferDetailView({ transfer, player: initialPlayer }: TransferDetailViewProps) {
  const { getPlayerById } = useSquadPlayers("masculino");
  const { items: allNews } = usePublishedNews();
  const { averages } = useSeasonPlayerRatings();
  const player = initialPlayer
    ? getPlayerById(initialPlayer.id) ?? initialPlayer
    : undefined;
  const kind = getTransferKind(transfer);
  const tone = toneByKind[kind === "renovacion" ? "renovacion" : "fichaje"];
  const visibleTabs = allTabs.filter((tab) => !tab.requiresPlayer || player);
  const [activeTab, setActiveTab] = useState<TransferDetailTab>("actualidad");
  const clubAnnouncementNews = getTransferClubAnnouncementNews(transfer, allNews);
  const playerNews = getTransferPlayerNews(transfer, allNews);
  const displayName = getTransferDisplayName(transfer);
  const originClub = getTransferOriginClub(transfer);
  const flag = player ? getNationalityFlag(player.nacionalidad) : "🇪🇸";

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#214C9B]/20 bg-white shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
      <div className={`relative overflow-hidden bg-gradient-to-br px-5 pb-6 pt-5 text-white sm:px-8 sm:pb-8 sm:pt-6 ${tone.hero}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="relative mx-auto w-[58%] max-w-[220px] sm:mx-0 sm:w-[200px]">
            {player ? (
              <PlayerAvatar
                player={player}
                size="xl"
                imageClassName="object-contain object-bottom"
                className="aspect-[4/5] h-auto w-full rounded-[1.5rem] shadow-2xl"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] bg-white/15 text-5xl font-extrabold shadow-2xl">
                {transfer.playerName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            {player && (
              <div className="absolute -bottom-3 -right-2 rounded-2xl bg-white px-4 py-2 text-4xl font-extrabold text-[#214C9B] shadow-xl">
                {player.dorsal}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone.chip}`}>
                {getTransferKindLabel(kind)}
              </span>
              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone.pill}`}>
                {transfer.status}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{displayName}</h1>
            <p className="mt-2 text-sm font-semibold text-white/85">
              {transfer.position} · {transfer.age} años · {flag} {player?.nacionalidad ?? "España"}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 text-left text-xs font-semibold sm:grid-cols-2">
              <InfoChip icon={Building2} label="Procedencia" value={originClub} />
              <InfoChip icon={Calendar} label="Fecha" value={formatDate(transfer.date)} />
              {player && (
                <>
                  <InfoChip label="Nacimiento" value={formatBirthDate(player.fechaNacimiento)} />
                  <InfoChip label="Contrato" value={formatContractDate(player.contratoHasta)} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-3">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                activeTab === tab.id ? tone.accent : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="transfer-detail-tab"
                  className="absolute inset-0 rounded-xl bg-slate-50"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6">
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
                clubAnnouncement={clubAnnouncementFromTransfer(transfer, clubAnnouncementNews)}
                playerNews={playerNews}
                accentClass={tone.accent}
                announcementTone={tone.announcement}
                transfer={transfer}
              />
            )}

            {player && activeTab === "resumen" && (
              <PlayerResumenSection player={player} fanRating={averages[player.id] ?? null} />
            )}
            {player && activeTab === "partidos" && <PlayerMatchesTable player={player} />}
            {player && activeTab === "estadisticas" && <PlayerStats player={player} />}
            {player && activeTab === "trayectoria" && <PlayerCareerTimeline player={player} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Building2;
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
