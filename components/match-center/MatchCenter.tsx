"use client";

import { useMemo, useState } from "react";
import { MatchCenterHeader, MatchCenterTabs } from "@/components/match-center/MatchCenterHeader";
import { MatchCenterSidebar } from "@/components/match-center/MatchCenterSidebar";
import { MatchLineupsPanel } from "@/components/match-center/MatchLineupsPanel";
import { MatchPressPanel } from "@/components/match-center/MatchPressPanel";
import { MatchPreviaPanel } from "@/components/match-center/MatchPreviaPanel";
import { MatchStatsPanel } from "@/components/match-center/MatchStatsPanel";
import type { MatchArticle, MatchDetail } from "@/types";
import type { Route } from "next";

type MatchCenterProps = {
  detail: MatchDetail;
  article: MatchArticle;
  backHref: Route;
  backLabel: string;
};

const FINISHED_TABS = [
  { id: "stats", label: "Stats" },
  { id: "lineups", label: "Alineaciones" },
  { id: "previa", label: "Previa" },
  { id: "prensa", label: "Post partido" },
] as const;

type FinishedTabId = (typeof FINISHED_TABS)[number]["id"];

export function MatchCenter({ detail, article, backHref, backLabel }: MatchCenterProps) {
  const isFinished = detail.match.status === "finished";
  const [activeTab, setActiveTab] = useState<FinishedTabId>("stats");

  const tabs = useMemo(() => (isFinished ? [...FINISHED_TABS] : []), [isFinished]);

  return (
    <div className="space-y-6">
      <MatchCenterHeader detail={detail} backHref={backHref} backLabel={backLabel} />

      {isFinished ? (
        <>
          <MatchCenterTabs tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as FinishedTabId)} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 rounded-[2rem] border border-[#214C9B]/20 bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-8">
              {activeTab === "stats" && (
                <MatchStatsPanel
                  categories={detail.stats}
                  homeLabel={detail.match.homeTeam}
                  awayLabel={detail.match.awayTeam}
                />
              )}
              {activeTab === "lineups" && (
                <MatchLineupsPanel
                  homeLabel={detail.match.homeTeam}
                  awayLabel={detail.match.awayTeam}
                  homeLineup={detail.homeLineup}
                  awayLineup={detail.awayLineup}
                />
              )}
              {activeTab === "previa" && <MatchPreviaPanel detail={detail} />}
              {activeTab === "prensa" && <MatchPressPanel detail={detail} article={article} />}
            </div>
            <MatchCenterSidebar />
          </div>
        </>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-8 rounded-[2rem] border border-[#214C9B]/20 bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-8">
            <MatchPreviaPanel detail={detail} compact rdpVideo={detail.rdpPrevia} showH2H={false} />
            <MatchLineupsPanel
              homeLabel={detail.match.homeTeam}
              awayLabel={detail.match.awayTeam}
              homeLineup={detail.homeLineup}
              awayLineup={detail.awayLineup}
            />
          </div>
          <MatchCenterSidebar />
        </div>
      )}
    </div>
  );
}
