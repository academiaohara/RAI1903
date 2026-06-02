"use client";

import { Megaphone } from "lucide-react";
import { MatchNewsCarousel } from "@/components/match-center/MatchNewsCarousel";
import {
  ClubAnnouncementCard,
  ClubAnnouncementCardStatic,
  clubAnnouncementIsLinkable,
  hasClubAnnouncementCard,
} from "@/components/squad/ClubAnnouncementCard";
import { PlayerClubAnnouncementEditPanel } from "@/components/squad/PlayerClubAnnouncementEditPanel";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { ClubAnnouncementDisplay } from "@/lib/club-announcement";
import type { NewsItem, TransferRumor } from "@/types";

type PlayerActualidadSectionProps = {
  clubAnnouncement?: ClubAnnouncementDisplay;
  playerNews: NewsItem[];
  accentClass?: string;
  announcementTone?: "fichaje" | "renovacion" | "default";
  /** Movimiento de mercado del jugador (para editar el comunicado en línea). */
  transfer?: TransferRumor;
};

export function PlayerActualidadSection({
  clubAnnouncement,
  playerNews,
  accentClass = "text-[#214C9B]",
  transfer,
}: PlayerActualidadSectionProps) {
  const { editMode } = useInlineEditing();
  const hasAnnouncement = Boolean(clubAnnouncement && hasClubAnnouncementCard(clubAnnouncement));
  const hasNews = playerNews.length > 0;
  const showAnnouncementEditor = Boolean(editMode && transfer);

  if (!hasAnnouncement && !hasNews && !showAnnouncementEditor) {
    return <p className="text-sm text-slate-500">Sin actualidad reciente para este jugador.</p>;
  }

  return (
    <div className="space-y-8">
      {(hasAnnouncement || showAnnouncementEditor) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className={accentClass} size={18} aria-hidden />
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Comunicado del club</h2>
          </div>
          {showAnnouncementEditor && transfer ? <PlayerClubAnnouncementEditPanel transfer={transfer} /> : null}
          {hasAnnouncement && clubAnnouncement ? (
            clubAnnouncementIsLinkable(clubAnnouncement) ? (
              <ClubAnnouncementCard announcement={clubAnnouncement} />
            ) : (
              <ClubAnnouncementCardStatic announcement={clubAnnouncement} />
            )
          ) : null}
        </section>
      )}

      {hasNews && <MatchNewsCarousel items={playerNews} title="Noticias del jugador" />}
    </div>
  );
}
