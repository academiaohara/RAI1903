import assert from "node:assert/strict";
import { RAI_TEAM_ID } from "@/data/mock";
import {
  aggregateAvilesStatsFromChronicles,
  applyChronicleStatsToSquad,
  buildChronicleAggregationMatches,
  matchIdsWithChronicleOverrides,
} from "@/lib/aviles-chronicle-stats";
import { matchResultOverrideKey } from "@/lib/fixture-inline-keys";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { Match, MatchEvent, MatchLineup } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const squad: SquadPlayer[] = [
  {
    id: "p6",
    nombre: "Ke",
    apellido: "Ba",
    dorsal: 6,
    posicion: "Centrocampista",
    rol: "MC",
    estado: "titular",
    edad: 25,
    fechaNacimiento: "2001-01-01",
    lugarNacimiento: "Avilés",
    nacionalidad: "España",
    altura: "1,80 m",
    peso: "74 kg",
    piernaBuena: "Derecha",
    contratoHasta: "2026-06-30",
    valorMercado: null,
    descripcion: "",
    foto: null,
    partidos: 0,
    minutos: 0,
    goles: 0,
    asistencias: 0,
    amarillas: 0,
    rojas: 0,
    historialPartidos: [],
    trayectoria: [],
  },
];

const placeholderMatch: Match = {
  id: "cms-ph-j1-m7",
  matchday: 1,
  homeTeamId: "cms-slot-13",
  awayTeamId: "cms-slot-14",
  homeTeam: "Equipo 13",
  awayTeam: "Equipo 14",
  date: "2025-09-14T17:00:00.000Z",
  competition: "primera-rfef",
  venue: "",
  status: "finished",
  homeScore: 2,
  awayScore: 1,
};

const bundles: SeasonBundlesMap = {
  "masculino:fixtures": {
    matchdays: [{ round: 1, matches: [placeholderMatch] }],
  },
};

const overrides: Record<string, unknown> = {
  [matchResultOverrideKey("masculino", placeholderMatch.id)]: {
    homeTeamId: RAI_TEAM_ID,
    homeTeam: "Real Avilés Industrial",
    awayTeamId: "real-irun",
    awayTeam: "Real Irun",
  },
  [`match:${placeholderMatch.id}:homeLineup`]: {
    formation: "4-3-3",
    starters: [{ number: 6, name: "KE BA" }],
    bench: [],
  } satisfies MatchLineup,
  [`match:${placeholderMatch.id}:events`]: [
    {
      id: "g1",
      minute: 55,
      type: "goal",
      team: "home",
      player: "KE BA",
    },
  ] satisfies MatchEvent[],
};

assert.deepEqual(matchIdsWithChronicleOverrides(overrides).sort(), [placeholderMatch.id].sort());

const getOverride = <T,>(key: string): T | undefined => overrides[key] as T | undefined;

const built = buildChronicleAggregationMatches({
  gender: "masculino",
  seasonMatches: [placeholderMatch],
  overrides,
  bundles,
  getOverride,
});

assert.equal(built.length, 1);
assert.equal(built[0]?.id, placeholderMatch.id);
assert.equal(built[0]?.homeTeamId, RAI_TEAM_ID);

const stats = aggregateAvilesStatsFromChronicles("masculino", squad, getOverride, built);
assert.ok(stats);
const playerStats = stats.get("p6");
assert.ok(playerStats);
assert.equal(playerStats.partidos, 1);
assert.equal(playerStats.goles, 1);
assert.equal(playerStats.historialPartidos.length, 1);

const merged = applyChronicleStatsToSquad(
  [
    { ...squad[0], partidos: 0, goles: 0 },
    {
      ...squad[0],
      id: "p99",
      dorsal: 99,
      nombre: "Otro",
      apellido: "Jugador",
      partidos: 3,
      goles: 1,
    },
  ],
  stats,
);

assert.equal(merged[0]?.partidos, 1);
assert.equal(merged[0]?.goles, 1);
assert.equal(merged[1]?.partidos, 3, "jugadores sin crónica conservan stats del CMS");

console.log("verify-chronicle-squad-sync: ok");
