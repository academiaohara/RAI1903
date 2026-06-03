"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Route } from "next";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useTransferMarketEditOptional } from "@/components/editor/TransferMarketEditProvider";
import { TransferFichaCardEditForm } from "@/components/fichajes/TransferFichaCardEditForm";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getTransferKind, getTransferKindLabel, getTransferOriginClub, getSquadPlayerForTransfer } from "@/lib/fichajes";
import { getNationalityFlag, getPlayerDisplayName } from "@/lib/squad-utils";
import type { TransferRumor } from "@/types";

const toneStyles = {
  fichaje: {
    border: "border-[#981915]",
    footer: "bg-[#981915]",
    badge: "bg-[#981915] text-white",
    gradient: "from-rose-50 via-orange-50/90 to-white",
    shadow: "shadow-[0_10px_28px_rgba(152,25,21,0.12)]",
    hoverShadow: "group-hover:shadow-[0_16px_36px_rgba(152,25,21,0.22)]",
    dorsal: "text-[#981915]",
  },
  renovacion: {
    border: "border-[#214C9B]",
    footer: "bg-[#214C9B]",
    badge: "bg-[#214C9B] text-white",
    gradient: "from-sky-100 via-blue-50/90 to-white",
    shadow: "shadow-[0_10px_28px_rgba(33,76,155,0.12)]",
    hoverShadow: "group-hover:shadow-[0_16px_36px_rgba(33,76,155,0.2)]",
    dorsal: "text-[#214C9B]",
  },
} as const;

type TransferFichaCardProps = {
  transfer: TransferRumor;
  index?: number;
  layout?: "carousel" | "grid";
};

export function TransferFichaCard({ transfer, index = 0, layout = "carousel" }: TransferFichaCardProps) {
  const { editMode } = useInlineEditing();
  const marketEdit = useTransferMarketEditOptional();
  const cmsEntry = marketEdit?.getEntry(transfer.id);
  const isCardEditing = Boolean(editMode && marketEdit && cmsEntry);

  const { squad } = useSquadPlayers("masculino");
  const kind = getTransferKind(transfer);
  const styles = toneStyles[kind === "renovacion" ? "renovacion" : "fichaje"];
  const player = getSquadPlayerForTransfer(transfer, squad);
  const displayName = player ? getPlayerDisplayName(player) : transfer.playerName;
  const fullName = player ? `${player.nombre} ${player.apellido}` : transfer.playerName;
  const wrapperClass =
    layout === "grid"
      ? `group w-full${isCardEditing ? " max-w-[220px]" : ""}`
      : `group shrink-0 snap-start${isCardEditing ? " w-[min(100%,220px)]" : " w-[min(100%,140px)] sm:w-[175px]"}`;
  const flag = player ? getNationalityFlag(player.nacionalidad) : "🇪🇸";
  const originClub = getTransferOriginClub(transfer);
  const initials = transfer.playerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const cardBody = (
        <article
          className={`overflow-hidden rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-sm rounded-bl-sm border-2 bg-gradient-to-b ${styles.gradient} ${styles.border} ${styles.shadow} transition-shadow ${styles.hoverShadow}`}
        >
          <div className="relative flex h-[118px] items-center justify-center overflow-hidden sm:h-[140px]">
            <div className="absolute left-2 top-2 z-10 flex flex-col items-center gap-1 rounded-lg bg-white px-1.5 py-1.5 shadow-sm">
              <span className="text-sm leading-none" role="img" aria-hidden>
                {flag}
              </span>
              {player ? (
                <span className={`text-sm font-black tabular-nums leading-none ${styles.dorsal}`}>{player.dorsal}</span>
              ) : (
                <span className={`text-[10px] font-black uppercase leading-none ${styles.dorsal}`}>{initials}</span>
              )}
            </div>

            <span className={`absolute bottom-2 right-2 z-10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}>
              {getTransferKindLabel(kind)}
            </span>

            {player ? (
              <PlayerAvatar
                player={player}
                bare
                placeholderTone="light"
                loading="eager"
                imageClassName="object-contain object-bottom"
                className="mx-auto aspect-[3/4] h-[94%] w-auto max-w-[88%] drop-shadow-[0_4px_12px_rgba(33,76,155,0.2)]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-white/40 to-transparent">
                <span className="text-4xl font-extrabold text-[#214C9B]/25">{initials}</span>
              </div>
            )}
          </div>

          <div className={`px-2 py-1.5 sm:px-3 sm:py-2 ${styles.footer}`}>
            <p className="truncate text-xs font-bold text-white sm:text-[15px]">{displayName}</p>
            <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-white/85 sm:text-[10px]">{originClub}</p>
          </div>
        </article>
  );

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
