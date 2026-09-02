import assert from "node:assert/strict";
import { computeClubStatsForGenderFromMatches } from "@/lib/season/club-league-stats";
import { applyMatchInlineOverride } from "@/lib/fixture-overrides";
import { resolveClubTeamIds } from "@/lib/season/club-team-ids";
import { getDefaultFixtureSource } from "@/lib/season/fixture-source";
import { filterMatchesForStatsCompetition } from "@/lib/competition/stats-filters";
import { matchResultOverrideKey } from "@/lib/fixture-inline-keys";
import { RAI_TEAM_ID } from "@/data/mock";
import type { Match } from "@/types";

const source = getDefaultFixtureSource();
const clubTeamIds = resolveClubTeamIds({}, "masculino", "1", source.matchdays);

const unplayedLeagueMatch: Match = {
  id: "verify-squad-stats-j1",
  homeTeamId: RAI_TEAM_ID,
  homeTeam: "Real Avilés Industrial",
  awayTeamId: "barakaldo-cf",
  awayTeam: "Barakaldo CF",
  date: "2026-08-30T17:00:00.000Z",
  competition: "primera-rfef",
  matchday: 1,
  status: "scheduled",
};

const override = {
  homeScore: 2,
  awayScore: 1,
  status: "finished" as const,
};

const overrides: Record<string, unknown> = {
  [matchResultOverrideKey("masculino", unplayedLeagueMatch.id)]: override,
};

const getOverride = (key: string) => overrides[key];
const editedMatch = applyMatchInlineOverride(unplayedLeagueMatch, getOverride, "masculino");

const rawStats = computeClubStatsForGenderFromMatches(
  "masculino",
  filterMatchesForStatsCompetition([unplayedLeagueMatch], "liga"),
  clubTeamIds,
);
const editedStats = computeClubStatsForGenderFromMatches(
  "masculino",
  filterMatchesForStatsCompetition([editedMatch], "liga"),
  clubTeamIds,
);

assert.equal(rawStats.partidos, 0, "unplayed match should not count");
assert.equal(editedStats.partidos, 1, "played match with override should count");
assert.equal(editedStats.victorias, 1);
assert.equal(editedStats.golesFavor, 2);
assert.equal(editedStats.golesContra, 1);

// Alternate CMS team id should still count when clubTeamIds includes it
const cmsTeamId = "rai-cms-id";
const cmsMatch: Match = {
  ...unplayedLeagueMatch,
  id: "verify-squad-stats-cms-id",
  homeTeamId: cmsTeamId,
  status: "finished",
  homeScore: 1,
  awayScore: 0,
};
const cmsStats = computeClubStatsForGenderFromMatches(
  "masculino",
  filterMatchesForStatsCompetition([cmsMatch], "liga"),
  [...clubTeamIds, cmsTeamId],
);
assert.equal(cmsStats.partidos, 1, "alternate CMS team id should count with clubTeamIds");

console.log("verify-squad-club-stats: ok");
