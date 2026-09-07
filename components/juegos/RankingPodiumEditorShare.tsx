"use client";

import { Download } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { GameModeId } from "@/lib/juegos";
import { GAME_MODE_LABELS } from "@/lib/juegos";
import {
  buildRankingPodiumContextLabel,
  buildRankingPodiumFileName,
  buildRankingPodiumShareText,
  downloadRankingPodium,
  getRankingPodiumFooterUrl,
  getRankingPodiumLogo,
  shareRankingPodiumOnX,
} from "@/lib/ranking-podium-share";
import type { RankingListEntry } from "@/lib/ranking-display";
import { getShareImageSrc } from "@/lib/share-image-inline";
import { cn } from "@/lib/utils";

type RankingPodiumEditorShareProps = {
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
  const resolvedAvatarUrl = getShareImageSrc(avatarUrl);

  return (
    <span className={cn("ranking-podium-avatar", size === "lg" && "ranking-podium-avatar--lg")}>
      {resolvedAvatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedAvatarUrl}
          alt=""
          loading="eager"
          decoding="sync"
          data-fallback-initial={initial}
          className="ranking-podium-avatar-image"
        />
      ) : (
        <span className="ranking-podium-avatar-fallback">{initial}</span>
      )}
    </span>
  );
}

function HiddenRankingPodium({
  podiumRef,
  gameKind,
  competitionLabel,
  seasonLabel,
  contextLabel,
  gameLabel,
  logo,
  topThree,
  countPoints,
  footerUrl,
}: {
  podiumRef: RefObject<HTMLDivElement | null>;
  gameKind: "quiniela" | "quinigol";
  competitionLabel: string;
  seasonLabel: string;
  contextLabel: string;
  gameLabel: string;
  logo: string;
  topThree: RankingListEntry[];
  countPoints: boolean;
  footerUrl: string;
}) {
  return (
    <div
      ref={podiumRef}
      className="ranking-podium-wrap ranking-podium-wrap--capture-source"
      aria-hidden="true"
      style={{ position: "fixed", left: "-10000px", top: 0, pointerEvents: "none", zIndex: -1 }}
    >
      <div className={`ranking-podium ranking-podium--${gameKind}`}>
        <header className="ranking-podium-header">
          <div className="ranking-podium-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`ranking-podium-logo ranking-podium-logo--${gameKind}`} src={logo} alt="" />
          </div>
          <div className="ranking-podium-meta">
            <strong>{competitionLabel}</strong>
            <span>{seasonLabel}</span>
            <span>{contextLabel}</span>
          </div>
        </header>

        <div className="ranking-podium-title">
          <span className="ranking-podium-title-eyebrow">{gameLabel}</span>
          <strong>TOP 3</strong>
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
  );
}

export function RankingPodiumEditorShare({
  gameKind,
  scope,
  round,
  seasonLabel,
  competitionLabel,
  entries,
  countPoints = true,
  className,
  enabled,
}: RankingPodiumEditorShareProps) {
  const { editMode } = useInlineEditing();
  const podiumRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  if (!(enabled ?? editMode) || entries.length < 3) return null;

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

  const run = async (action: "x" | "download") => {
    if (!podiumRef.current || sharing) return;
    setSharing(true);
    try {
      const options = { node: podiumRef.current, fileName, shareText };
      if (action === "x") await shareRankingPodiumOnX(options);
      if (action === "download") await downloadRankingPodium(options);
    } finally {
      setSharing(false);
    }
  };

  return (
    <section className={cn("ranking-podium-editor-share", className)} aria-label="Compartir podio del ranking">
      <div className="ranking-podium-editor-bar">
        <p className="ranking-podium-editor-label">Editor · imagen del podio para redes</p>
        <div className="game-ticket-actions">
          <div className="game-ticket-actions-share">
          <button
            type="button"
            disabled={sharing}
            onClick={() => void run("x")}
            aria-label={sharing ? "Generando imagen" : "Compartir podio en X"}
            title="Compartir podio en X"
          >
            <span aria-hidden>X</span>
            <span className="game-ticket-action-label">{sharing ? "Generando…" : "Compartir podio en X"}</span>
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
      </div>

      <HiddenRankingPodium
        podiumRef={podiumRef}
        gameKind={gameKind}
        competitionLabel={competitionLabel}
        seasonLabel={seasonLabel}
        contextLabel={contextLabel}
        gameLabel={gameLabel}
        logo={logo}
        topThree={topThree}
        countPoints={countPoints}
        footerUrl={footerUrl}
      />
    </section>
  );
}
