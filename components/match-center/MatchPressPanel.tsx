import { ClubChronicleCard } from "@/components/match-center/ClubChronicleCard";
import { MatchNewsCarousel } from "@/components/match-center/MatchNewsCarousel";
import { MatchVideoBlock } from "@/components/match-center/MatchVideoBlock";
import { getClubChronicleNews } from "@/lib/match-articles";
import type { MatchArticle, MatchDetail } from "@/types";

export function MatchPressPanel({ detail, article }: { detail: MatchDetail; article: MatchArticle }) {
  const clubChronicle = getClubChronicleNews(article);
  const clubNews = detail.chronicleNews.filter(
    (item) => item.channel === "club" && item.id !== clubChronicle?.id,
  );
  const pressNews = detail.chronicleNews.filter((item) => item.channel === "prensa");

  return (
    <div className="space-y-8">
      {detail.rdpPostpartido && <MatchVideoBlock video={detail.rdpPostpartido} />}

      {clubChronicle && (
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Cronica del club</h2>
          <div className="mt-3 rounded-2xl border border-[#214C9B]/15 bg-white p-5 sm:p-6">
            <ClubChronicleCard item={clubChronicle} />
          </div>
        </section>
      )}

      {clubNews.length > 0 && <MatchNewsCarousel items={clubNews} title="Noticias del club" />}
      {pressNews.length > 0 && <MatchNewsCarousel items={pressNews} title="Post partido en medios" />}
      {detail.chronicleNews.length > 0 && clubNews.length === 0 && pressNews.length === 0 && !clubChronicle && (
        <MatchNewsCarousel items={detail.chronicleNews} title="Post partido y cronicas" />
      )}
    </div>
  );
}
