"use client";

import { Megaphone } from "lucide-react";
import {
  ClubAnnouncementCard,
  ClubAnnouncementCardStatic,
  clubAnnouncementIsLinkable,
  hasClubAnnouncementCard,
} from "@/components/squad/ClubAnnouncementCard";
import { PlayerClubAnnouncementEditPanel } from "@/components/squad/PlayerClubAnnouncementEditPanel";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { ClubAnnouncementDisplay } from "@/lib/club-announcement";
import type { TransferRumor } from "@/types";

type PlayerActualidadSectionProps = {
  clubAnnouncement?: ClubAnnouncementDisplay;
  accentClass?: string;
  /** Movimiento de mercado del jugador (para editar el comunicado en línea). */
  transfer?: TransferRumor;
};

export function PlayerActualidadSection({
  clubAnnouncement,
  accentClass = "text-[#214C9B]",
  transfer,
}: PlayerActualidadSectionProps) {
  const { editMode } = useInlineEditing();
  const hasAnnouncement = Boolean(clubAnnouncement && hasClubAnnouncementCard(clubAnnouncement));
  const showAnnouncementEditor = Boolean(editMode && transfer);

  if (!hasAnnouncement && !showAnnouncementEditor) {
    return <p className="text-sm text-slate-500">Sin crónica de fichaje o renovación para este jugador.</p>;
  }

  return (
    <div className="space-y-8">
      {(hasAnnouncement || showAnnouncementEditor) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className={accentClass} size={18} aria-hidden />
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              Crónica del fichaje
            </h2>
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
    </div>
  );
}
