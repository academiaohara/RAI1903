import { MatchNewsCarousel } from "@/components/match-center/MatchNewsCarousel";
import { MatchVideoBlock } from "@/components/match-center/MatchVideoBlock";
import type { MatchDetail } from "@/types";

export function MatchPressPanel({ detail }: { detail: MatchDetail }) {
  const pressNews = detail.chronicleNews.filter((item) => item.channel === "prensa");

  return (
    <div className="space-y-8">
      {detail.rdpPostpartido && <MatchVideoBlock video={detail.rdpPostpartido} />}
      {pressNews.length > 0 && <MatchNewsCarousel items={pressNews} title="Post partido en medios" />}
    </div>
  );
}
