"use client";

import { Fragment } from "react";
import { HomeTransfersGate } from "@/components/fichajes/HomeTransfersGate";
import {
  HomeCompetitionEmptyHint,
  HomeMatchBannersBlock,
  HomeRecentUpcomingBlock,
  HomeStandingsStatsBlock,
} from "@/components/home/HomeCompetitionBlocks";
import { HomeOtherTeamsMatchesBlock } from "@/components/home/HomeOtherTeamsMatchesBlock";
import { HomeNewsBlock } from "@/components/home/HomeNewsBlock";
import { useHomeLayout } from "@/components/home/HomeLayoutProvider";
import type { HomeSectionId } from "@/lib/home-layout";

const SECTION_RENDERERS: Record<HomeSectionId, () => React.ReactNode> = {
  match_banners: () => <HomeMatchBannersBlock />,
  standings_stats: () => <HomeStandingsStatsBlock />,
  recent_upcoming: () => <HomeRecentUpcomingBlock />,
  news: () => <HomeNewsBlock />,
  other_teams_matches: () => <HomeOtherTeamsMatchesBlock />,
  transfers: () => <HomeTransfersGate />,
};

export function HomePageSections() {
  const { sectionOrder } = useHomeLayout();

  return (
    <>
      <HomeCompetitionEmptyHint />
      {sectionOrder.map((id) => (
        <Fragment key={id}>{SECTION_RENDERERS[id]()}</Fragment>
      ))}
    </>
  );
}
