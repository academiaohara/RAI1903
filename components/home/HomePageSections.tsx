"use client";

import dynamic from "next/dynamic";
import { Fragment } from "react";
import {
  HomeCompetitionEmptyHint,
  HomeMatchBannersBlock,
  HomeRecentUpcomingBlock,
  HomeStandingsStatsBlock,
} from "@/components/home/HomeCompetitionBlocks";
import { useHomeLayout } from "@/components/home/HomeLayoutProvider";
import type { HomeSectionId } from "@/lib/home-layout";

const HomeNewsBlock = dynamic(() =>
  import("@/components/home/HomeNewsBlock").then((m) => ({ default: m.HomeNewsBlock })),
);
const HomeMediaRaiBlock = dynamic(() =>
  import("@/components/home/HomeMediaRaiBlock").then((m) => ({ default: m.HomeMediaRaiBlock })),
);
const HomeOtherTeamsMatchesBlock = dynamic(() =>
  import("@/components/home/HomeOtherTeamsMatchesBlock").then((m) => ({
    default: m.HomeOtherTeamsMatchesBlock,
  })),
);
const HomeTransfersGate = dynamic(() =>
  import("@/components/fichajes/HomeTransfersGate").then((m) => ({ default: m.HomeTransfersGate })),
);

const SECTION_RENDERERS: Record<HomeSectionId, () => React.ReactNode> = {
  match_banners: () => <HomeMatchBannersBlock />,
  standings_stats: () => <HomeStandingsStatsBlock />,
  recent_upcoming: () => <HomeRecentUpcomingBlock />,
  news: () => <HomeNewsBlock />,
  media_rai: () => <HomeMediaRaiBlock />,
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
