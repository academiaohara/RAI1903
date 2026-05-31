"use client";

import { ClubChronicleCard } from "@/components/match-center/ClubChronicleCard";
import { useLinkedClubNews } from "@/components/editor/MatchArticleNewsLinker";
import type { MatchArticle, NewsItem } from "@/types";

type MatchArticleClubNewsBlockProps = {
  article: MatchArticle;
  newsItems: NewsItem[];
};

export function MatchArticleClubNewsBlock({ article, newsItems }: MatchArticleClubNewsBlockProps) {
  const linked = useLinkedClubNews(article, newsItems);

  if (!linked) return null;

  return (
    <section className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Noticia oficial</p>
      <ClubChronicleCard item={linked} />
    </section>
  );
}
