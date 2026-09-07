"use client";

import { Download, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import type { GameModeId } from "@/lib/juegos";
import { GAME_MODE_LABELS } from "@/lib/juegos";
import {
  buildRankingPodiumContextLabel,
  buildRankingPodiumFileName,
  buildRankingPodiumShareText,
  downloadRankingPodium,
  getRankingPodiumFooterUrl,
  getRankingPodiumLogo,
  shareRankingPodium,
  shareRankingPodiumOnX,
} from "@/lib/ranking-podium-share";
import type { RankingListEntry } from "@/lib/ranking-display";
import { cn } from "@/lib/utils";

type RankingPodiumShareProps = {
  gameKind: "quiniela" | "quinigol";
  scope: "round" | "season";
  round: number;
  seasonLabel: string;
  competitionLabel: string;
  entries: RankingListEntry[];
  countPoints?: boolean;
  className?: string;
};

const podiumOrder = [
  { rank: 2, medal: "🥈", pedestalClass: "ranking-podium-pedestal--silver" },
  { rank: 1, medal: "🥇", pedestalClass: "ranking-podium-pedestal--gold" },
  { rank: 3, medal: "🥉", pedestalClass: "ranking-podium-pedestal--bronze" },
] as const;

function formatHandle(handle: string): string {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function formatPoints(points: number, countPoints: boolean): string {
  return countPoints ? `${points} pts` : "—";
}

function PodiumAvatar({
  avatarUrl,
  handle,
  size,
}: {
  avatarUrl: string | null;
  handle: string;
  size: "lg" | "md";
}) {
  const initial = handle.replace(/^@/, "").charAt(0).toUpperCase() || "?";

  return (
    <span className={cn("ranking-podium-avatar", size === "lg" && "ranking-podium-avatar--lg")}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="ranking-podium-avatar-image" />
      ) : (
        <span className="ranking-podium-avatar-fallback">{initial}</span>
      )}
    </span>
  );
}

export function RankingPodiumShare({
  gameKind,
  scope,
  round,
  seasonLabel,
  competitionLabel,
  entries,
  countPoints = true,
  className,
}: RankingPodiumShareProps) {
  const podiumRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  if (entries.length < 3) return null;

  const topThree = entries.slice(0, 3);
  const contextLabel = buildRankingPodiumContextLabel(scope, round);
  const fileName = buildRankingPodiumFileName(gameKind, scope, round);
  const footerUrl = getRankingPodiumFooterUrl(gameKind as GameModeId);
  const shareText = buildRankingPodiumShareText({
    gameKind,
    scope,
    round,
    entries: topThree,
    countPoints,
    footerUrl,
  });
  const gameLabel = GAME_MODE_LABELS[gameKind];
  const logo = getRankingPodiumLogo(gameKind);

  const run = async (action: "share" | "x" | "download") => {
    if (!podiumRef.current || sharing) return;
    setSharing(true);
    try {
      const options = { node: podiumRef.current, fileName, shareText };
      if (action === "share") await shareRankingPodium(options);
      if (action === "x") await shareRankingPodiumOnX(options);
      if (action === "download") await downloadRankingPodium(options);
    } finally {
      setSharing(false);
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <section className={cn("ranking-podium-preview", className)} aria-label="Podio del ranking">
      <div className="game-ticket-actions" data-podium-export-hidden="true">
        <div className="game-ticket-actions-share">
          {canNativeShare ? (
            <button
              type="button"
              disabled={sharing}
              onClick={() => void run("share")}
              aria-label={sharing ? "Generando imagen" : "Compartir podio"}
              title="Compartir podio"
            >
              <Share2 size={16} aria-hidden />
              <span className="game-ticket-action-label">{sharing ? "Generando…" : "Compartir podio"}</span>
            </button>
          ) : null}
          <button
            type="button"
            disabled={sharing}
            onClick={() => void run("x")}
            aria-label={sharing ? "Generando imagen" : "Compartir podio en X"}
            title="Compartir podio en X"
          >
            <span aria-hidden>X</span>
            <span className="game-ticket-action-label">{sharing ? "Generando…" : "Compartir en X"}</span>
          </button>
          <button
            type="button"
            disabled={sharing}
            onClick={() => void run("download")}
            aria-label={sharing ? "Generando imagen" : "Descargar podio"}
            title="Descargar podio"
          >
            <Download size={16} aria-hidden />
            <span className="game-ticket-action-label">{sharing ? "Generando…" : "Descargar imagen"}</span>
          </button>
        </div>
      </div>

      <div ref={podiumRef} className="ranking-podium-wrap">
        <div className={`ranking-podium ranking-podium--${gameKind}`}>
          <header className="ranking-podium-header">
            <div className="ranking-podium-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={`ranking-podium-logo ranking-podium-logo--${gameKind}`}
                src={logo}
                alt=""
              />
            </div>
            <div className="ranking-podium-meta">
              <strong>{competitionLabel}</strong>
              <span>{seasonLabel}</span>
              <span>{contextLabel}</span>
            </div>
          </header>

          <div className="ranking-podium-title">
            <span className="ranking-podium-title-eyebrow">{gameLabel}</span>
            <strong>Podio del ranking</strong>
          </div>

          <div className="ranking-podium-stage">
            {podiumOrder.map(({ rank, medal, pedestalClass }) => {
              const entry = topThree[rank - 1];
              if (!entry) return null;

              return (
                <div
                  key={entry.userId}
                  className={cn("ranking-podium-slot", rank === 1 && "ranking-podium-slot--first")}
                >
                  <div className="ranking-podium-slot-top">
                    <span className="ranking-podium-medal" aria-hidden>
                      {medal}
                    </span>
                    <PodiumAvatar
                      avatarUrl={entry.avatarUrl}
                      handle={entry.handle}
                      size={rank === 1 ? "lg" : "md"}
                    />
                    <p className="ranking-podium-handle">{formatHandle(entry.handle)}</p>
                    <p className="ranking-podium-points">{formatPoints(entry.points, countPoints)}</p>
                  </div>
                  <div className={cn("ranking-podium-pedestal", pedestalClass)}>
                    <span>{rank}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="ranking-podium-footer">
            <span>{footerUrl}</span>
          </footer>
        </div>
      </div>
    </section>
  );
}
