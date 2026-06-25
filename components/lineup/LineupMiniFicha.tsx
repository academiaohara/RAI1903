"use client";

import type { ReactNode } from "react";
import type { SquadPlayer } from "@/types/squad";
import { getFichaPositionAbbrev } from "@/lib/ficha-design";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { cn } from "@/lib/utils";

export type LineupMiniFichaSize = "pitch" | "sidebar";

type LineupMiniFichaProps = {
  player: SquadPlayer;
  size?: LineupMiniFichaSize;
  className?: string;
  photo?: ReactNode;
};

export function LineupMiniFicha({
  player,
  size = "sidebar",
  className,
  photo,
}: LineupMiniFichaProps) {
  const positionAbbrev = getFichaPositionAbbrev(player.posicion);
  const displayName = getPlayerDisplayName(player);

  const photoNode =
    photo ?? (
      <PlayerAvatar
        player={player}
        bare
        placeholderTone="light"
        imageClassName="object-cover object-[center_8%]"
        className="h-full w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
      />
    );

  return (
    <div className={cn("lineup-mini-ficha", `lineup-mini-ficha--${size}`, className)}>
      <div className="lineup-mini-ficha-frame">
        <article className="trading-ficha-card trading-ficha-card--fichaje lineup-mini-ficha-card">
          <div className="trading-ficha-stripes" aria-hidden />

          <span className="lineup-mini-ficha-position">{positionAbbrev}</span>

          <div className="lineup-mini-ficha-photo">{photoNode}</div>

          <div className="trading-ficha-name-plate" aria-hidden>
            <div className="trading-ficha-name-plate-inner">
              <p className="trading-ficha-first-name">{player.nombre}</p>
              <p className="trading-ficha-last-name">{player.apellido || displayName}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
