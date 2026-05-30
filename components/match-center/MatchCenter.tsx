"use client";

import { BarChart3, Megaphone, Shirt, Star, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchCenterHeader, MatchCenterTabs } from "@/components/match-center/MatchCenterHeader";
import { MatchLineupsPanel } from "@/components/match-center/MatchLineupsPanel";
import { MatchPressPanel } from "@/components/match-center/MatchPressPanel";
import { MatchRatingsPanel } from "@/components/match-center/MatchRatingsPanel";
import { getRaiTeamId } from "@/lib/fixtures";
import { MatchPreviaPanel } from "@/components/match-center/MatchPreviaPanel";
import { MatchStatsPanel } from "@/components/match-center/MatchStatsPanel";
import type { MatchDetail } from "@/types";
import type { Route } from "next";

type MatchCenterProps = {
  detail: MatchDetail;
  backHref: Route;
  backLabel: string;
};

const FINISHED_TABS_BASE = [
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

export function MatchCenter({ detail, backHref, backLabel }: MatchCenterProps) {
  const isFinished = detail.match.status === "finished";
  const showRatings = isRaiMatch(detail);
  const [activeTab, setActiveTab] = useState<FinishedTabId>("stats");

  const tabs = useMemo(() => {
    if (!isFinished) return [];
    return showRatings
      ? [...FINISHED_TABS_BASE]
      : FINISHED_TABS_BASE.filter((tab) => tab.id !== "valoraciones");
  }, [isFinished, showRatings]);

  return (
    <div className="space-y-6">
      <MatchCenterHeader detail={detail} backHref={backHref} backLabel={backLabel} />

      {isFinished ? (
        <>
          <MatchCenterTabs tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as FinishedTabId)} />

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
            {activeTab === "valoraciones" && showRatings && (
              <MatchRatingsPanel key={detail.match.id} detail={detail} />
            )}
            {activeTab === "prensa" && <MatchPressPanel detail={detail} />}
          </div>
        </>
      ) : (
        <div className="min-w-0 space-y-8 rounded-[2rem] border border-[#214C9B]/20 bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-8">
          <MatchPreviaPanel detail={detail} compact rdpVideo={detail.rdpPrevia} showH2H={false} />
          <MatchLineupsPanel
            homeLabel={detail.match.homeTeam}
            awayLabel={detail.match.awayTeam}
            homeLineup={detail.homeLineup}
            awayLineup={detail.awayLineup}
          />
        </div>
      )}
    </div>
  );
}
