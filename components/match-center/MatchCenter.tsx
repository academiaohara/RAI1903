"use client";

import { BarChart3, ListOrdered, Megaphone, Shirt, Star, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchArticleNewsLinker } from "@/components/editor/MatchArticleNewsLinker";
import { MatchArticleClubNewsBlock } from "@/components/match-articles/MatchArticleClubNewsBlock";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { MatchArticleInlineBlock } from "@/components/match-articles/MatchArticleInlineBlock";
import { usePublishedNews } from "@/hooks/usePublishedNews";
import { MatchCenterHeader, MatchCenterTabs } from "@/components/match-center/MatchCenterHeader";
import { MatchEventsPanel } from "@/components/match-center/MatchEventsPanel";
import { MatchLineupsPanel } from "@/components/match-center/MatchLineupsPanel";
import { useMatchDetailOverrides } from "@/components/match-center/useMatchDetailOverrides";
import { MatchPressPanel } from "@/components/match-center/MatchPressPanel";
import { MatchRatingsPanel } from "@/components/match-center/MatchRatingsPanel";
import { getRaiTeamId } from "@/lib/fixtures";
import { MatchPreviaPanel } from "@/components/match-center/MatchPreviaPanel";
import { MatchStatsPanel } from "@/components/match-center/MatchStatsPanel";
import type { MatchArticle, MatchDetail } from "@/types";
import type { Route } from "next";

type MatchCenterProps = {
  detail: MatchDetail;
  article?: MatchArticle;
  backHref: Route;
  backLabel: string;
};

const FINISHED_TABS_BASE = [
  { id: "eventos", label: "Eventos", icon: ListOrdered },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "lineups", label: "Alineaciones", icon: Shirt },
  { id: "previa", label: "Previa", icon: Target },
  { id: "valoraciones", label: "Valoraciones", icon: Star },
  { id: "prensa", label: "Post partido", icon: Megaphone },
] as const;

const PREVIA_ONLY_TABS = [{ id: "previa", label: "Previa", icon: Target }] as const;

type FinishedTabId = (typeof FINISHED_TABS_BASE)[number]["id"];
type PreviaTabId = (typeof PREVIA_ONLY_TABS)[number]["id"];
type ActiveTabId = FinishedTabId | PreviaTabId;

function isRaiMatch(detail: MatchDetail): boolean {
  const raiId = getRaiTeamId(detail.gender);
  return detail.match.homeTeamId === raiId || detail.match.awayTeamId === raiId;
}

const panelClassName =
  "min-w-0 rounded-[2rem] border border-[#214C9B]/20 bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-8";

export function MatchCenter({ detail, article, backHref, backLabel }: MatchCenterProps) {
  const { items: newsItems } = usePublishedNews();
  const { editMode } = useInlineEditing();
  const resolvedDetail = useMatchDetailOverrides(detail);
  const isPreviaArticle = article?.type === "previa";
  const isFinished = resolvedDetail.match.status === "finished" && !isPreviaArticle;
  const showRatings = isFinished && isRaiMatch(resolvedDetail);
  const [activeTab, setActiveTab] = useState<ActiveTabId>(isPreviaArticle ? "previa" : "eventos");

  const tabs = useMemo(() => {
    if (isPreviaArticle) return [...PREVIA_ONLY_TABS];
    if (!isFinished) return [];
    return showRatings
      ? [...FINISHED_TABS_BASE]
      : FINISHED_TABS_BASE.filter((tab) => tab.id !== "valoraciones");
  }, [isFinished, isPreviaArticle, showRatings]);

  const showArticleBody = article?.type === "previa" || article?.type === "cronica";
  const showClubNews = article && (article.type === "cronica" || article.type === "previa");

  const previaPanel = (
    <MatchPreviaPanel detail={resolvedDetail} rdpVideo={resolvedDetail.rdpPrevia} showCaraACara />
  );

  return (
    <div className="space-y-6">
      <MatchCenterHeader
        detail={resolvedDetail}
        backHref={backHref}
        backLabel={backLabel}
        variant={isPreviaArticle ? "preview" : "match"}
      />

      {isPreviaArticle ? (
        <div className={panelClassName}>
          <div className="space-y-8">
            {showArticleBody && article && <MatchArticleInlineBlock article={article} />}
            {showClubNews &&
              (editMode ? (
                <MatchArticleNewsLinker article={article} newsItems={newsItems} />
              ) : (
                <MatchArticleClubNewsBlock article={article} newsItems={newsItems} />
              ))}
            <MatchCenterTabs
              tabs={tabs}
              active={activeTab}
              onChange={(id) => setActiveTab(id as ActiveTabId)}
            />
            {activeTab === "previa" && previaPanel}
          </div>
        </div>
      ) : (
        <>
          {showArticleBody && article?.type === "cronica" && <MatchArticleInlineBlock article={article} />}
          {showClubNews &&
            (editMode ? (
              <MatchArticleNewsLinker article={article} newsItems={newsItems} />
            ) : (
              <MatchArticleClubNewsBlock article={article} newsItems={newsItems} />
            ))}

          {isFinished ? (
            <>
              <MatchCenterTabs
                tabs={tabs}
                active={activeTab}
                onChange={(id) => setActiveTab(id as ActiveTabId)}
              />

              <div className={panelClassName}>
                {activeTab === "eventos" && (
                  <MatchEventsPanel
                    matchId={resolvedDetail.match.id}
                    events={resolvedDetail.events}
                    homeLabel={resolvedDetail.match.homeTeam}
                    awayLabel={resolvedDetail.match.awayTeam}
                  />
                )}
                {activeTab === "stats" && (
                  <MatchStatsPanel
                    matchId={resolvedDetail.match.id}
                    categories={resolvedDetail.stats}
                    homeLabel={resolvedDetail.match.homeTeam}
                    awayLabel={resolvedDetail.match.awayTeam}
                  />
                )}
                {activeTab === "lineups" && (
                  <MatchLineupsPanel
                    matchId={resolvedDetail.match.id}
                    homeLabel={resolvedDetail.match.homeTeam}
                    awayLabel={resolvedDetail.match.awayTeam}
                    homeLineup={resolvedDetail.homeLineup}
                    awayLineup={resolvedDetail.awayLineup}
                  />
                )}
                {activeTab === "previa" && previaPanel}
                {activeTab === "valoraciones" && showRatings && (
                  <MatchRatingsPanel key={`${resolvedDetail.match.id}-ratings`} detail={resolvedDetail} />
                )}
                {activeTab === "prensa" && <MatchPressPanel detail={resolvedDetail} />}
              </div>
            </>
          ) : (
            <div className={panelClassName}>{previaPanel}</div>
          )}
        </>
      )}
    </div>
  );
}
