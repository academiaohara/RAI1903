import { Megaphone } from "lucide-react";
import { MatchNewsCarousel } from "@/components/match-center/MatchNewsCarousel";
import {
  ClubAnnouncementCard,
  ClubAnnouncementCardStatic,
  clubAnnouncementIsLinkable,
  hasClubAnnouncementCard,
} from "@/components/squad/ClubAnnouncementCard";
import type { ClubAnnouncementDisplay } from "@/lib/club-announcement";
import type { NewsItem } from "@/types";

type PlayerActualidadSectionProps = {
  clubAnnouncement?: ClubAnnouncementDisplay;
  playerNews: NewsItem[];
  accentClass?: string;
  announcementTone?: "fichaje" | "renovacion" | "default";
};

export function PlayerActualidadSection({
  clubAnnouncement,
  playerNews,
  accentClass = "text-[#214C9B]",
}: PlayerActualidadSectionProps) {
  const hasAnnouncement = Boolean(clubAnnouncement && hasClubAnnouncementCard(clubAnnouncement));
  const hasNews = playerNews.length > 0;

  if (!hasAnnouncement && !hasNews) {
    return <p className="text-sm text-slate-500">Sin actualidad reciente para este jugador.</p>;
  }

  return (
    <div className="space-y-8">
      {hasAnnouncement && clubAnnouncement && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className={accentClass} size={18} aria-hidden />
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Comunicado del club</h2>
          </div>
          {clubAnnouncementIsLinkable(clubAnnouncement) ? (
            <ClubAnnouncementCard announcement={clubAnnouncement} />
          ) : (
            <ClubAnnouncementCardStatic announcement={clubAnnouncement} />
          )}
        </section>
      )}

      {hasNews && <MatchNewsCarousel items={playerNews} title="Noticias del jugador" />}
    </div>
  );
}
