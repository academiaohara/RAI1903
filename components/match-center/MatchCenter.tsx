"use client";

import { BarChart3, ListOrdered, Megaphone, Shirt, Star, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchArticleInlineBlock } from "@/components/match-articles/MatchArticleInlineBlock";
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

type FinishedTabId = (typeof FINISHED_TABS_BASE)[number]["id"];

function isRaiMatch(detail: MatchDetail): boolean {
  const raiId = getRaiTeamId(detail.gender);
  return detail.match.homeTeamId === raiId || detail.match.awayTeamId === raiId;
}

export function MatchCenter({ detail, article, backHref, backLabel }: MatchCenterProps) {
  const resolvedDetail = useMatchDetailOverrides(detail);
  const isFinished = resolvedDetail.match.status === "finished";
  const showRatings = isRaiMatch(resolvedDetail);
  const [activeTab, setActiveTab] = useState<FinishedTabId>("eventos");

  const tabs = useMemo(() => {
    if (!isFinished) return [];
    return showRatings
      ? [...FINISHED_TABS_BASE]
      : FINISHED_TABS_BASE.filter((tab) => tab.id !== "valoraciones");
  }, [isFinished, showRatings]);

  return (
    <div className="space-y-6">
      <MatchCenterHeader detail={resolvedDetail} backHref={backHref} backLabel={backLabel} />
      {article && <MatchArticleInlineBlock article={article} />}

      {isFinished ? (
        <>
          <MatchCenterTabs tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as FinishedTabId)} />

          <div className="min-w-0 rounded-[2rem] border border-[#214C9B]/20 bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-8">
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
            {activeTab === "previa" && <MatchPreviaPanel detail={resolvedDetail} />}
            {activeTab === "valoraciones" && showRatings && (
              <MatchRatingsPanel key={resolvedDetail.match.id} detail={resolvedDetail} />
            )}
            {activeTab === "prensa" && <MatchPressPanel detail={resolvedDetail} />}
          </div>
        </>
      ) : (
        <div className="min-w-0 space-y-8 rounded-[2rem] border border-[#214C9B]/20 bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-8">
          <MatchPreviaPanel detail={resolvedDetail} compact rdpVideo={resolvedDetail.rdpPrevia} showH2H={false} />
          <MatchLineupsPanel
            matchId={resolvedDetail.match.id}
            homeLabel={resolvedDetail.match.homeTeam}
            awayLabel={resolvedDetail.match.awayTeam}
            homeLineup={resolvedDetail.homeLineup}
            awayLineup={resolvedDetail.awayLineup}
          />
        </div>
      )}
    </div>
  );
}
