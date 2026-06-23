"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Route } from "next";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useTransferMarketEditOptional } from "@/components/editor/TransferMarketEditProvider";
import { TransferFichaCardEditForm } from "@/components/fichajes/TransferFichaCardEditForm";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { TradingPlayerFicha } from "@/components/squad/TradingPlayerFicha";
import { useSeason } from "@/components/season/SeasonProvider";
import { useTransferSquadPlayer } from "@/hooks/useTransferSquadPlayer";
import { seasonIdToDisplayLabel, usesLegacyFichaDesign } from "@/lib/ficha-design";
import { getTransferKind, getTransferKindAbbrev, getTransferKindLabel, getTransferOriginClub } from "@/lib/fichajes";
import { resolveTransferSeasonId } from "@/lib/transfer-market-windows";
import { getSquadClubInfo } from "@/lib/squad-data";
import { getNationalityFlag, getPlayerDisplayName } from "@/lib/squad-utils";
import type { TransferRumor } from "@/types";
import type { SquadPosition, SquadRoleCode } from "@/types/squad";

const toneStyles = {
  fichaje: {
    border: "border-[#214C9B]",
    footer: "bg-[#214C9B]",
    footerText: "text-white",
    footerSubtext: "text-white/85",
    badge: "bg-white text-[#214C9B]",
    dorsalBox: "bg-white",
    gradient: "from-sky-100 via-blue-50/90 to-white",
    shadow: "shadow-[0_10px_28px_rgba(33,76,155,0.12)]",
    hoverShadow: "group-hover:shadow-[0_16px_36px_rgba(33,76,155,0.2)]",
    dorsal: "text-[#214C9B]",
    placeholderInitials: "text-[#214C9B]/25",
    avatarShadow: "drop-shadow-[0_4px_12px_rgba(33,76,155,0.2)]",
  },
  renovacion: {
    border: "border-[#981915]",
    footer: "bg-[#981915]",
    footerText: "text-white",
    footerSubtext: "text-white/85",
    badge: "bg-white text-[#981915]",
    dorsalBox: "bg-white",
    gradient: "from-rose-50 via-orange-50/90 to-white",
    shadow: "shadow-[0_10px_28px_rgba(152,25,21,0.12)]",
    hoverShadow: "group-hover:shadow-[0_16px_36px_rgba(152,25,21,0.22)]",
    dorsal: "text-[#981915]",
    placeholderInitials: "text-[#981915]/25",
    avatarShadow: "drop-shadow-[0_4px_12px_rgba(152,25,21,0.2)]",
  },
  cesion: {
    border: "border-[#981915]",
    footer: "bg-white",
    footerText: "text-[#981915]",
    footerSubtext: "text-[#981915]/80",
    badge: "border border-[#981915] bg-white text-[#981915]",
    dorsalBox: "border border-[#981915]/25 bg-white",
    gradient: "from-white via-slate-50/80 to-white",
    shadow: "shadow-[0_10px_28px_rgba(152,25,21,0.08)]",
    hoverShadow: "group-hover:shadow-[0_16px_36px_rgba(152,25,21,0.16)]",
    dorsal: "text-[#981915]",
    placeholderInitials: "text-[#981915]/20",
    avatarShadow: "drop-shadow-[0_4px_12px_rgba(152,25,21,0.15)]",
  },
} as const;

type TransferFichaCardProps = {
  transfer: TransferRumor;
  index?: number;
  layout?: "carousel" | "grid";
};

function splitTransferPlayerName(playerName: string): { nombre: string; apellido: string } {
  const parts = playerName.trim().split(/\s+/);
  if (parts.length <= 1) return { nombre: parts[0] ?? "", apellido: "" };
  return { nombre: parts[0] ?? "", apellido: parts.slice(1).join(" ") };
}

function transferTradingMeta(
  transfer: TransferRumor,
  player: ReturnType<typeof useTransferSquadPlayer>,
): {
  nombre: string;
  apellido: string;
  posicion: SquadPosition;
  rol: SquadRoleCode;
  edad: number;
} {
  if (player) {
    return {
      nombre: player.nombre,
      apellido: player.apellido,
      posicion: player.posicion,
      rol: player.rol,
      edad: player.edad,
    };
  }

  const { nombre, apellido } = splitTransferPlayerName(transfer.playerName);
  return {
    nombre,
    apellido,
    posicion: "Centrocampista",
    rol: "MC",
    edad: 0,
  };
}

export function TransferFichaCard({ transfer, index = 0, layout = "carousel" }: TransferFichaCardProps) {
  const { editMode } = useInlineEditing();
  const marketEdit = useTransferMarketEditOptional();
  const cmsEntry = marketEdit?.getEntry(transfer.id);
  const isCardEditing = Boolean(editMode && marketEdit && cmsEntry);
  const { viewedSeasonId } = useSeason();

  const player = useTransferSquadPlayer(transfer);
  const kind = getTransferKind(transfer);
  const styles = toneStyles[kind];
  const displayName = player ? getPlayerDisplayName(player) : transfer.playerName;
  const fullName = player ? `${player.nombre} ${player.apellido}` : transfer.playerName;
  const wrapperClass =
    layout === "grid"
      ? `group w-full${isCardEditing ? " max-w-[220px]" : ""}`
      : `group shrink-0 snap-start${isCardEditing ? " w-[min(100%,220px)]" : " w-[min(43vw,128px)] sm:w-[175px]"}`;
  const flag = player ? getNationalityFlag(player.nacionalidad) : "🇪🇸";
  const originClub = getTransferOriginClub(transfer);
  const initials = transfer.playerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const transferSeasonId = resolveTransferSeasonId(transfer, viewedSeasonId);
  const seasonLabel = seasonIdToDisplayLabel(transferSeasonId);
  const useTradingDesign = !usesLegacyFichaDesign(seasonLabel);
  const clubCrest = getSquadClubInfo("masculino").escudo;
  const tradingMeta = transferTradingMeta(transfer, player);

  const kindAbbrev = getTransferKindAbbrev(kind);

  const legacyCardBody = (
    <article
      className={`overflow-hidden rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-sm rounded-bl-sm border-2 bg-gradient-to-b ${styles.gradient} ${styles.border} ${styles.shadow} transition-shadow ${styles.hoverShadow}`}
    >
      <div className="relative flex h-[108px] items-center justify-center overflow-hidden sm:h-[140px]">
        <div
          className={`absolute left-1.5 top-1.5 z-10 flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 shadow-sm sm:left-2 sm:top-2 sm:gap-1 sm:px-1.5 sm:py-1.5 ${styles.dorsalBox}`}
        >
          <span className="text-xs leading-none sm:text-sm" role="img" aria-hidden>
            {flag}
          </span>
          {player ? (
            <span className={`text-xs font-black tabular-nums leading-none sm:text-sm ${styles.dorsal}`}>{player.dorsal}</span>
          ) : (
            <span className={`text-[10px] font-black uppercase leading-none ${styles.dorsal}`}>{initials}</span>
          )}
        </div>

        <span
          className={`absolute bottom-1.5 right-1.5 z-10 rounded-lg px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide sm:bottom-2 sm:right-2 sm:px-2 sm:py-1 sm:text-[10px] ${styles.badge}`}
        >
          {kindAbbrev}
        </span>

        {player ? (
          <PlayerAvatar
            player={player}
            bare
            placeholderTone="light"
            loading="eager"
            imageClassName="object-contain object-bottom"
            className={`mx-auto aspect-[3/4] h-[94%] w-auto max-w-[88%] ${styles.avatarShadow}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-white/40 to-transparent">
            <span className={`text-4xl font-extrabold ${styles.placeholderInitials}`}>{initials}</span>
          </div>
        )}
      </div>

      <div className={`px-2 py-1.5 sm:px-3 sm:py-2 ${styles.footer}`}>
        <p className={`truncate text-[11px] font-bold sm:text-[15px] ${styles.footerText}`}>{displayName}</p>
        <p className={`mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${styles.footerSubtext}`}>
          {originClub}
        </p>
      </div>
    </article>
  );

  const tradingCardBody = (
    <TradingPlayerFicha
      seasonLabel={seasonLabel}
      crestUrl={clubCrest}
      crestAlt="Real Avilés Industrial"
      nombre={tradingMeta.nombre}
      apellido={tradingMeta.apellido}
      posicion={tradingMeta.posicion}
      rol={tradingMeta.rol}
      edad={tradingMeta.edad || 0}
      ageLabel={tradingMeta.edad > 0 ? undefined : "—"}
      variant={kind}
      secondaryStat={player ? player.rol : "—"}
      subtitle={<p className="truncate uppercase tracking-wide">{originClub}</p>}
      photo={
        player ? (
          <PlayerAvatar
            player={player}
            bare
            placeholderTone="light"
            loading="eager"
            imageClassName="object-cover object-[center_8%]"
            className={`h-full w-full ${styles.avatarShadow}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className={`text-4xl font-extrabold ${styles.placeholderInitials}`}>{initials}</span>
          </div>
        )
      }
    />
  );

  const cardBody = useTradingDesign ? tradingCardBody : legacyCardBody;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={wrapperClass}
    >
      {isCardEditing ? (
        <div className="block w-full text-left">
          {cardBody}
          <TransferFichaCardEditForm entry={cmsEntry!} />
        </div>
      ) : (
        <Link
          href={`/fichajes/${transfer.id}` as Route}
          className="block w-full text-left"
          aria-label={`${getTransferKindLabel(kind)} de ${fullName}, procedente de ${originClub}`}
        >
          {cardBody}
        </Link>
      )}
    </motion.div>
  );
}
