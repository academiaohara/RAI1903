import assert from "node:assert/strict";
import { resolveGrupoForTeamId } from "../lib/equipo-liga-resolve";
import type { SeasonBundlesMap } from "../lib/cms/season-bundles";

function testCmsSlugIdInGrupo1() {
  const bundles = {
    "masculino:competition_config": {
      teamsPerGroup: 20,
      groupCount: 2,
      groupTeams: {
        "1": [{ id: "racing-club-ferrol", name: "Racing Club Ferrol" }],
      },
    },
  } as SeasonBundlesMap;

  assert.equal(resolveGrupoForTeamId("racing-club-ferrol", "masculino", bundles), "1");
}

function testMockFallbackWithoutBundles() {
  assert.equal(resolveGrupoForTeamId("ferrol", "masculino"), "1");
  assert.equal(resolveGrupoForTeamId("unknown-slug", "masculino"), undefined);
}

testCmsSlugIdInGrupo1();
testMockFallbackWithoutBundles();
console.log("verify-resolve-grupo: ok");
