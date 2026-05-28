import Link from "next/link";
import { ExternalLink, Megaphone } from "lucide-react";
import { MatchNewsCarousel } from "@/components/match-center/MatchNewsCarousel";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

type PlayerActualidadSectionProps = {
  clubAnnouncement?: {
    text: string;
    date?: string;
    newsItem?: NewsItem;
  };
  playerNews: NewsItem[];
  accentClass?: string;
  announcementTone?: "fichaje" | "renovacion" | "default";
};

const announcementToneClass = {
  fichaje: "border-[#981915]/20 bg-rose-50/50",
  renovacion: "border-[#214C9B]/20 bg-blue-50/40",
  default: "border-slate-200 bg-slate-50",
} as const;

export function PlayerActualidadSection({
  clubAnnouncement,
  playerNews,
  accentClass = "text-[#214C9B]",
  announcementTone = "default",
}: PlayerActualidadSectionProps) {
  const hasAnnouncement = Boolean(clubAnnouncement?.text);
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
          <div className={`rounded-2xl border p-5 ${announcementToneClass[announcementTone]}`}>
            <p className="text-sm leading-7 text-slate-700">{clubAnnouncement.text}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Real Aviles Industrial
                {clubAnnouncement.date ? ` · ${formatDate(clubAnnouncement.date)}` : ""}
              </p>
              {clubAnnouncement.newsItem && (
                <Link
                  href={clubAnnouncement.newsItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${accentClass} hover:underline`}
                >
                  Ver noticia oficial
                  <ExternalLink size={14} aria-hidden />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {hasNews && <MatchNewsCarousel items={playerNews} title="Noticias del jugador" />}
    </div>
  );
}
