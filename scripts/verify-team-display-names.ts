import assert from "node:assert/strict";
import { resolveFixtureTeamDisplayName } from "../lib/cms/teams-bundle";
import type { SeasonBundlesMap } from "../lib/cms/season-bundles";
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
  assert.equal(name, "Real Irun", "prioriza nombre de guía de liga frente a «Equipo N» del partido");
}

function testResolveFromCmsWhenNoGroup() {
  const cmsTeams: CmsTeamRecord[] = [{ id: "real-irun", name: "Real Irun CF", removed: false }];
  const bundles = {} as SeasonBundlesMap;

  const name = resolveFixtureTeamDisplayName("real-irun", "Equipo 3", cmsTeams, bundles, "masculino");
  assert.equal(name, "Real Irun CF");
}

testResolveFromGroupTeams();
testResolveFromCmsWhenNoGroup();
console.log("verify-team-display-names: ok");
