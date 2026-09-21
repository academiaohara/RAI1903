/**
 * Verifica que el goleador del Avilés puntúa igual con y sin overrides de jornada.
 * Ejecutar: npx --yes tsx scripts/verify-quiniela-scorer-scoring.ts
 */
import { RAI_TEAM_ID } from "@/data/mock";
import { bundleMapKey } from "@/lib/cms/season-bundles";
import { matchGoalsOverrideKey } from "@/lib/match-goals";
import {
  buildQuinielaScoringContext,
  createInlineOverridesReader,
  resolveQuinielaScoringContextForTeam,
  scoringOptionsForMatch,
  type QuinielaRankingScoringResources,
} from "@/lib/quiniela/scoring-context";
import { scoreUserMatchday } from "@/lib/quiniela-ranking";
import { scorePredictionPoints } from "@/lib/quiniela";
import type { Match, Matchday, Prediction } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const matchId = "aviles-test-match";
const playerId = "player-9";
const playerName = "Jugador Test";

const avilesMatch: Match = {
  id: matchId,
  matchday: 1,
  homeTeamId: RAI_TEAM_ID,
  awayTeamId: "rival-1",
  homeTeam: "Real Avilés Industrial",
  awayTeam: "Rival FC",
  date: "2025-09-01T18:00:00.000Z",
  competition: "primera-rfef",
  venue: "Test",
  status: "finished",
  homeScore: 1,
  awayScore: 0,
};

const matchday: Matchday = { round: 1, matches: [avilesMatch] };

const squad: SquadPlayer[] = [
  {
    id: playerId,
    dorsal: 9,
    nombre: "Jugador",
    apellido: "Test",
    posicion: "Delantero",
    rol: "SD",
    estado: "titular",
    edad: 24,
    fechaNacimiento: "2001-01-01",
    lugarNacimiento: "Avilés",
    nacionalidad: "España",
    altura: "180",
    peso: "75",
    piernaBuena: "Derecha",
    contratoHasta: "2027",
    valorMercado: null,
    descripcion: "",
    foto: null,
    goles: 1,
    asistencias: 0,
    partidos: 1,
    minutos: 90,
    amarillas: 0,
    rojas: 0,
    historialPartidos: [],
    trayectoria: [],
  },
];

const prediction: Prediction = {
  matchId,
  matchday: 1,
  outcome: "1",
  goalsHome: 1,
  goalsAway: 0,
  scorerId: playerId,
  scorer: playerName,
  updatedAt: "2025-09-01T12:00:00.000Z",
};

const inlineOverrides = {
  [matchGoalsOverrideKey("masculino", matchId)]: {
    goals: [{ teamSide: "home", playerKey: playerId, minute: 12 }],
  },
};

const bundles = {
  [bundleMapKey("masculino", "squad")]: { players: squad },
} as QuinielaRankingScoringResources["bundles"];

const resources: QuinielaRankingScoringResources = {
  bundles,
  matchdays: [matchday],
  getOverride: createInlineOverridesReader(inlineOverrides),
};

const withoutOverrides = buildQuinielaScoringContext(bundles, [matchday], RAI_TEAM_ID);
const withOverrides = resolveQuinielaScoringContextForTeam(resources, RAI_TEAM_ID, new Map());

const pointsWithoutGoals = scorePredictionPoints(
  avilesMatch,
  prediction,
  scoringOptionsForMatch(withoutOverrides, avilesMatch),
);
const pointsWithGoals = scorePredictionPoints(
  avilesMatch,
  prediction,
  scoringOptionsForMatch(withOverrides, avilesMatch),
);

if (pointsWithoutGoals !== 2) {
  console.error(`FAIL: without goals override expected 2 pts (signo+porra), got ${pointsWithoutGoals}`);
  process.exit(1);
}

if (pointsWithGoals !== 3) {
  console.error(`FAIL: with goals override expected 3 pts (signo+porra+goleador), got ${pointsWithGoals}`);
  process.exit(1);
}

const ranked = scoreUserMatchday(
  matchday,
  { [matchId]: prediction },
  true,
  withOverrides,
);

if (ranked.points !== 3) {
  console.error(`FAIL: scoreUserMatchday expected 3 pts, got ${ranked.points}`);
  process.exit(1);
}

console.log("OK: goleador del Avilés suma +1 cuando hay goles cargados en jornada");
