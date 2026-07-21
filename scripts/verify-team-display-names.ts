import assert from "node:assert/strict";
import { remapFixturesBundleTeamIds } from "../lib/cms/remap-fixture-team-ids";
import { resolveFixtureTeamDisplayName } from "../lib/cms/teams-bundle";
import type { SeasonBundlesMap, SeasonFixturesBundle } from "../lib/cms/season-bundles";
import type { CmsTeamRecord } from "../lib/cms/teams-bundle";

function testResolveFromGroupTeams() {
  const cmsTeams: CmsTeamRecord[] = [{ id: "real-irun", name: "Equipo 42", removed: false }];
  const bundles = {
    "masculino:competition_config": {
      teamsPerGroup: 20,
      groupCount: 1,
      groupTeams: {
        "1": [{ id: "real-irun", name: "Real Irun" }],
      },
    },
  } as SeasonBundlesMap;

  const name = resolveFixtureTeamDisplayName("real-irun", "Equipo 42", cmsTeams, bundles, "masculino");
  assert.equal(name, "Real Irun", "prefers league guide name over placeholder match name «Equipo N»");
}

function testResolveFromCmsWhenNoGroup() {
  const cmsTeams: CmsTeamRecord[] = [{ id: "real-irun", name: "Real Irun CF", removed: false }];
  const bundles = {} as SeasonBundlesMap;

  const name = resolveFixtureTeamDisplayName("real-irun", "Equipo 3", cmsTeams, bundles, "masculino");
  assert.equal(name, "Real Irun CF");
}

function testRemapFixtureTeamIds() {
  const bundle = {
    matchdays: [
      {
        round: 1,
        matches: [
          {
            id: "m1",
            competition: "primera-rfef",
            matchday: 1,
            date: "2026-08-10T18:00:00.000Z",
            status: "scheduled",
            homeTeamId: "grupo-1-slot-42",
            awayTeamId: "real-aviles-industrial",
            homeTeam: "Equipo 42",
            awayTeam: "Real Avilés Industrial",
            venue: "",
          },
        ],
      },
    ],
  } satisfies SeasonFixturesBundle;

  const remapped = remapFixturesBundleTeamIds(bundle, [
    { from: "grupo-1-slot-42", to: "real-irun" },
  ]);
  assert.equal(remapped.matchdays[0]?.matches[0]?.homeTeamId, "real-irun");
}

testResolveFromGroupTeams();
testResolveFromCmsWhenNoGroup();
testRemapFixtureTeamIds();
console.log("verify-team-display-names: ok");
