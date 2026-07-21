import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parsePrimerEquipoFixturesJson } from "../lib/cms/parse-fixtures-json";
import type { SeasonBundlesMap } from "../lib/cms/season-bundles";
import { resolveTeamCatalogEntry } from "../lib/cms/resolve-team-catalog";

const bundles = {} as SeasonBundlesMap;

function testGrupo2OnlyDoesNotFillGrupo1() {
  const input = JSON.stringify({
    jornadas: [
      {
        jornada: 1,
        grupo: "2",
        partidos: [
          { fecha: "2026-08-30", local: "ad-alcorcon", visitante: "algeciras-cf" },
        ],
      },
    ],
  });

  const result = parsePrimerEquipoFixturesJson(input, { gender: "masculino", bundles });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.matchdays.length, 0, "grupo I debe quedar vacío");
  assert.equal(result.data.matchdaysGrupo2?.length, 1, "grupo II debe tener jornadas");
  assert.equal(result.data.touchedGrupos.grupo1, false);
  assert.equal(result.data.touchedGrupos.grupo2, true);
  assert.equal(result.data.matchdaysGrupo2?.[0]?.matches[0]?.homeTeamId, "alcorcon");
}

function testGrupo1DefaultWithoutMarker() {
  const input = JSON.stringify({
    jornadas: [
      {
        jornada: 1,
        partidos: [{ fecha: "2026-08-30", local: "real-aviles-industrial", visitante: "barakaldo-cf" }],
      },
    ],
  });

  const result = parsePrimerEquipoFixturesJson(input, { gender: "masculino", bundles });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.matchdays.length, 1);
  assert.equal(result.data.matchdaysGrupo2, undefined);
  assert.equal(result.data.touchedGrupos.grupo1, true);
  assert.equal(result.data.touchedGrupos.grupo2, false);
}

function testStadiumFromSlugAlias() {
  const entry = resolveTeamCatalogEntry("ad-alcorcon", bundles, "masculino");
  assert.equal(entry.id, "alcorcon");
  assert.ok(entry.stadium.length > 0, "debe resolver estadio del local por slug");

  const bilbao = resolveTeamCatalogEntry("bilbao-athletic", bundles, "masculino");
  assert.equal(bilbao.id, "athletic-bilbao-b");
  assert.ok(bilbao.stadium.includes("Lezama"), "bilbao-athletic debe enlazar con Athletic B");
}

function testUploadedCalendarSample() {
  const path = "/home/ubuntu/.cursor/projects/workspace/uploads/calendario_grupo2_26_27_ids_web_2af3.json";
  const raw = readFileSync(path, "utf8");
  const result = parsePrimerEquipoFixturesJson(raw, { gender: "masculino", bundles });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.matchdays.length, 0);
  assert.equal(result.data.matchdaysGrupo2?.length, 38);
  assert.equal(result.data.touchedGrupos.grupo2, true);

  const matches = result.data.matchdaysGrupo2?.flatMap((md) => md.matches) ?? [];
  assert.equal(matches.length, 380);
  const withVenue = matches.filter((match) => match.venue.trim().length > 0);
  assert.ok(withVenue.length > 200, "la mayoría de locales conocidos deben tener estadio");

  const alcorconHome = matches.find((match) => match.homeTeamId === "alcorcon");
  assert.ok(alcorconHome?.venue.includes("Santo Domingo"));
}

testGrupo2OnlyDoesNotFillGrupo1();
testGrupo1DefaultWithoutMarker();
testStadiumFromSlugAlias();
testUploadedCalendarSample();
console.log("verify-parse-fixtures-grupo2: ok");
