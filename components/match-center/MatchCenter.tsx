"use client";

import { BarChart3, Clapperboard, ListOrdered, Megaphone, Shirt, Star, Target } from "lucide-react";
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
import { MatchResumenPanel } from "@/components/match-center/MatchResumenPanel";
import { MatchRatingsPanel } from "@/components/match-center/MatchRatingsPanel";
import { getRaiTeamId } from "@/lib/fixtures";
import { hasMatchLineups } from "@/lib/match-lineups";
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
  { id: "resumen", label: "Resumen", icon: Clapperboard },
] as const;

const UPCOMING_PREVIA_TAB = { id: "previa", label: "Previa", icon: Target } as const;
const UPCOMING_LINEUPS_TAB = { id: "lineups", label: "Alineaciones", icon: Shirt } as const;

type TabDefinition = {
  id: string;
  label: string;
  icon: typeof Target;
};

type FinishedTabId = (typeof FINISHED_TABS_BASE)[number]["id"];
type UpcomingTabId = typeof UPCOMING_PREVIA_TAB.id | typeof UPCOMING_LINEUPS_TAB.id;
type ActiveTabId = FinishedTabId | UpcomingTabId;

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
  const isFinished = resolvedDetail.match.status === "finished";
  const showRatings = isFinished && isRaiMatch(resolvedDetail);
  const lineupsAvailable = hasMatchLineups(resolvedDetail);

  const tabs = useMemo((): TabDefinition[] => {
    if (isFinished) {
      return showRatings
        ? [...FINISHED_TABS_BASE]
        : FINISHED_TABS_BASE.filter((tab) => tab.id !== "valoraciones");
    }

    const upcomingTabs: TabDefinition[] = [UPCOMING_PREVIA_TAB];
    if (lineupsAvailable) upcomingTabs.push(UPCOMING_LINEUPS_TAB);
    return upcomingTabs;
  }, [isFinished, lineupsAvailable, showRatings]);

  const [activeTab, setActiveTab] = useState<ActiveTabId>(isFinished ? "eventos" : "previa");
  const showTabBar = isFinished || tabs.length > 1;

  const showArticleBodyAboveTabs = !isFinished && article !== undefined;
  const showClubNews = article !== undefined;

  const previaPanel = (
    <MatchPreviaPanel detail={resolvedDetail} rdpVideo={resolvedDetail.rdpPrevia} showCaraACara />
  );

  const previaTabContent = <div className="space-y-8">{previaPanel}</div>;

  const panelContent = (() => {
    if (!isFinished && tabs.length === 1) return previaPanel;

    if (activeTab === "eventos") {
      return (
        <MatchEventsPanel
          matchId={resolvedDetail.match.id}
          events={resolvedDetail.events}
          homeLabel={resolvedDetail.match.homeTeam}
          awayLabel={resolvedDetail.match.awayTeam}
          homeTeamId={resolvedDetail.match.homeTeamId}
          awayTeamId={resolvedDetail.match.awayTeamId}
          gender={resolvedDetail.gender}
        />
      );
    }
    if (activeTab === "stats") {
      return (
        <MatchStatsPanel
          matchId={resolvedDetail.match.id}
          categories={resolvedDetail.stats}
          homeLabel={resolvedDetail.match.homeTeam}
          awayLabel={resolvedDetail.match.awayTeam}
        />
      );
    }
    if (activeTab === "lineups") {
      return (
        <MatchLineupsPanel
          matchId={resolvedDetail.match.id}
          homeLabel={resolvedDetail.match.homeTeam}
          awayLabel={resolvedDetail.match.awayTeam}
          homeLineup={resolvedDetail.homeLineup}
          awayLineup={resolvedDetail.awayLineup}
          homeTeamId={resolvedDetail.match.homeTeamId}
          awayTeamId={resolvedDetail.match.awayTeamId}
          gender={resolvedDetail.gender}
        />
      );
    }
    if (activeTab === "previa") return previaTabContent;
    if (activeTab === "valoraciones" && showRatings) {
      return <MatchRatingsPanel key={`${resolvedDetail.match.id}-ratings`} detail={resolvedDetail} />;
    }
    if (activeTab === "prensa") return <MatchPressPanel detail={resolvedDetail} />;
    if (activeTab === "resumen") return <MatchResumenPanel detail={resolvedDetail} />;
    return null;
  })();

  return (
    <div className="space-y-6">
      <MatchCenterHeader detail={resolvedDetail} backHref={backHref} backLabel={backLabel} />

      {showArticleBodyAboveTabs && article && (
        <div className={panelClassName}>
          <MatchArticleInlineBlock article={article} sectionLabel="Previa" />
        </div>
      )}

      {showClubNews &&
        (editMode ? (
          <MatchArticleNewsLinker article={article} newsItems={newsItems} />
        ) : (
          <MatchArticleClubNewsBlock article={article} newsItems={newsItems} />
        ))}

      {showTabBar && tabs.length > 0 && (
        <MatchCenterTabs
          tabs={tabs}
          active={activeTab}
          onChange={(id) => setActiveTab(id as ActiveTabId)}
        />
      )}

      {panelContent && <div className={panelClassName}>{panelContent}</div>}
    </div>
  );
}
