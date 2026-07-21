import assert from "node:assert/strict";
import { RAI_TEAM_ID } from "@/data/mock";
import { findMatchInBundles } from "@/lib/season/find-match-in-bundles";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { Match } from "@/types";

const bundles: SeasonBundlesMap = {
  "masculino:fixtures": {
    matchdays: [
      {
        round: 1,
        matches: [
          {
            id: "cms-ph-j1-m7",
            matchday: 1,
            homeTeamId: "cms-slot-13",
            awayTeamId: "cms-slot-14",
            homeTeam: "Equipo 13",
            awayTeam: "Equipo 14",
            date: "2025-08-10T16:00:00.000Z",
            competition: "primera-rfef",
            venue: "",
            status: "finished",
            homeScore: 2,
            awayScore: 1,
          },
        ],
      },
    ],
  },
};

const withoutOverride = findMatchInBundles(bundles, "cms-ph-j1-m7", { gender: "masculino" });
assert.equal(withoutOverride, undefined, "sin override el partido placeholder no cuenta como del Avilés");

const withOverride = findMatchInBundles(bundles, "cms-ph-j1-m7", {
  gender: "masculino",
  mapMatch: (match: Match) => ({
    ...match,
    homeTeamId: RAI_TEAM_ID,
    homeTeam: "Real Avilés Industrial",
    awayTeamId: "real-irun",
    awayTeam: "Real Irun",
  }),
});
assert.equal(withOverride?.awayTeam, "Real Irun", "con override de equipos debe resolver el partido del Avilés");

console.log("verify-find-match-in-bundles: ok");
