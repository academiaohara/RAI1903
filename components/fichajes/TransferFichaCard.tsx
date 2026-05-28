"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Route } from "next";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { getTransferKind, getTransferKindLabel, getTransferOriginClub, getSquadPlayerForTransfer } from "@/lib/fichajes";
import { getNationalityFlag, getPlayerDisplayName } from "@/lib/squad-utils";
import type { TransferRumor } from "@/types";

const toneStyles = {
  fichaje: {
    border: "border-[#981915]",
    footer: "bg-[#981915]",
    badge: "bg-[#981915]/10 text-[#981915]",
    gradient: "from-rose-50 via-orange-50/90 to-white",
    shadow: "shadow-[0_10px_28px_rgba(152,25,21,0.12)]",
    hoverShadow: "group-hover:shadow-[0_16px_36px_rgba(152,25,21,0.22)]",
    dorsal: "text-[#981915]",
  },
  renovacion: {
    border: "border-[#214C9B]",
    footer: "bg-[#214C9B]",
    badge: "bg-blue-50 text-[#214C9B]",
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
  const kind = getTransferKind(transfer);
  const styles = toneStyles[kind];
  const player = getSquadPlayerForTransfer(transfer);
  const displayName = player ? getPlayerDisplayName(player) : transfer.playerName;
  const fullName = player ? `${player.nombre} ${player.apellido}` : transfer.playerName;
  const wrapperClass =
    layout === "grid" ? "group w-full" : "group w-[min(100%,200px)] shrink-0 snap-start sm:w-[210px]";
  const flag = player ? getNationalityFlag(player.nacionalidad) : "🇪🇸";
  const originClub = getTransferOriginClub(transfer);
  const initials = transfer.playerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={wrapperClass}
    >
      <Link
        href={`/fichajes/${transfer.id}` as Route}
        className="block w-full text-left"
        aria-label={`${getTransferKindLabel(kind)} de ${fullName}, procedente de ${originClub}`}
      >
        <article
          className={`overflow-hidden rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-sm rounded-bl-sm border-2 bg-gradient-to-b ${styles.gradient} ${styles.border} ${styles.shadow} transition-shadow ${styles.hoverShadow}`}
        >
          <div className="relative aspect-[4/5] max-h-[200px] overflow-hidden sm:max-h-[210px]">
            <div className="absolute left-2 top-2 z-10 flex flex-col items-center gap-1.5 rounded-lg bg-white px-2 py-2 shadow-sm">
              <span className="text-base leading-none sm:text-lg" role="img" aria-hidden>
                {flag}
              </span>
              {player ? (
                <span className={`text-base font-black tabular-nums leading-none sm:text-lg ${styles.dorsal}`}>{player.dorsal}</span>
              ) : (
                <span className={`text-xs font-black uppercase leading-none ${styles.dorsal}`}>{initials}</span>
              )}
            </div>

            <span className={`absolute right-2 top-2 z-10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}>
              {getTransferKindLabel(kind)}
            </span>

            {player ? (
              <PlayerAvatar
                player={player}
                bare
                placeholderTone="light"
                className="absolute inset-x-0 bottom-0 mx-auto aspect-[3/4] h-[88%] w-auto max-w-[calc(100%-2.5rem)] drop-shadow-[0_6px_16px_rgba(33,76,155,0.25)]"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-b from-white/40 to-transparent pt-8">
                <span className="text-5xl font-extrabold text-[#214C9B]/25">{initials}</span>
              </div>
            )}
          </div>

          <div className={`px-3 py-2 ${styles.footer}`}>
            <p className="truncate text-sm font-bold text-white sm:text-[15px]">{displayName}</p>
            <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-white/85">Desde {originClub}</p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
