"use client";

import { useMemo } from "react";
import { CaraACaraPanel } from "@/components/match-center/CaraACaraPanel";
import { useSeason } from "@/components/season/SeasonProvider";
import { buildCaraACaraData } from "@/lib/cara-a-cara";
import { useEditedMatchdays } from "@/hooks/useEditedMatchdays";
import { resolveLeagueContextForMatch } from "@/lib/season/league-context-for-match";
import type { MatchDetail } from "@/types";

export function MatchCaraACaraSection({ detail }: { detail: MatchDetail }) {
  const { match, gender } = detail;
  const { bundles, getEnrichedFixtureSource } = useSeason();

  const leagueContext = useMemo(
    () => resolveLeagueContextForMatch(match, gender, getEnrichedFixtureSource(gender), bundles),
    [bundles, gender, getEnrichedFixtureSource, match],
  );

  const editedLeagueMatchdays = useEditedMatchdays(leagueContext?.leagueMatchdays ?? [], gender);

  const data = useMemo(
    () =>
      leagueContext
        ? buildCaraACaraData(match.homeTeamId, match.awayTeamId, gender, {
            referenceMatch: match,
            leagueMatchdays: editedLeagueMatchdays,
            sourceTeams: leagueContext.sourceTeams,
          })
        : buildCaraACaraData(match.homeTeamId, match.awayTeamId, gender),
    [editedLeagueMatchdays, gender, leagueContext, match],
  );

  if (!data) return null;

  return <CaraACaraPanel data={data} gender={gender} />;
}
