"use client";

import type { ReactNode } from "react";
import type { SquadPlayer } from "@/types/squad";
import { getNationalityFlagUrl, getPlayerDisplayName } from "@/lib/squad-utils";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { cn } from "@/lib/utils";

export type LineupMiniFichaSize = "pitch" | "sidebar";

type LineupMiniFichaProps = {
  player: SquadPlayer;
  size?: LineupMiniFichaSize;
  crestUrl?: string | null;
  className?: string;
  photo?: ReactNode;
};

export function LineupMiniFicha({
  player,
  size = "sidebar",
  crestUrl,
  className,
  photo,
}: LineupMiniFichaProps) {
  const displayName = getPlayerDisplayName(player).toUpperCase();
  const flagUrl = getNationalityFlagUrl(player.nacionalidad);

  const photoNode =
    photo ?? (
      <PlayerAvatar
        player={player}
        bare
        placeholderTone="light"
        imageClassName="object-cover object-[center_8%]"
        className="h-full w-full"
      />
    );

  return (
    <div className={cn("lineup-mini-ficha", `lineup-mini-ficha--${size}`, className)}>
      <article className="lineup-ficha-card">
        <div className="lineup-ficha-photo">
          {photoNode}
          {crestUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="lineup-ficha-crest" src={crestUrl} alt="" width={16} height={16} loading="lazy" />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="lineup-ficha-flag"
            src={flagUrl}
            alt={player.nacionalidad}
            width={18}
            height={12}
            loading="lazy"
          />
        </div>
        <div className="lineup-ficha-name">{displayName}</div>
      </article>
    </div>
  );
}
