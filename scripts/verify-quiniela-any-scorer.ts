/**
 * Verifica que acertar un goleador distinto al primero también suma el punto.
 * Ejecutar: npx --yes tsx scripts/verify-quiniela-any-scorer.ts
 */
import { RAI_TEAM_ID } from "@/data/mock";
import { bundleMapKey } from "@/lib/cms/season-bundles";
import { matchGoalsOverrideKey } from "@/lib/match-goals";
import {
  createInlineOverridesReader,
  resolveQuinielaScoringContextForTeam,
  scoringOptionsForMatch,
  type QuinielaRankingScoringResources,
} from "@/lib/quiniela/scoring-context";
import { isScorerPredictionCorrect, scorePredictionPoints } from "@/lib/quiniela";
import type { Match, Matchday, Prediction } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const matchId = "aviles-two-goals";
const firstScorerId = "jose-santamaria";
const secondScorerId = "second-scorer";

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
  homeScore: 2,
  awayScore: 0,
};

const matchday: Matchday = { round: 1, matches: [avilesMatch] };

const squad: SquadPlayer[] = [
  {
    id: firstScorerId,
    dorsal: 9,
    nombre: "Jose",
    apellido: "Santamaria",
    posicion: "Delantero",
    rol: "DC",
    estado: "titular",
    edad: 27,
    fechaNacimiento: "1999-12-05",
    lugarNacimiento: "España",
    nacionalidad: "España",
    altura: "181",
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
  {
    id: secondScorerId,
    dorsal: 14,
    nombre: "Segundo",
    apellido: "Goleador",
    posicion: "Delantero",
    rol: "SD",
    estado: "titular",
    edad: 24,
    fechaNacimiento: "2001-01-01",
    lugarNacimiento: "España",
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
    minutos: 45,
    amarillas: 0,
    rojas: 0,
    historialPartidos: [],
    trayectoria: [],
  },
];

const inlineOverrides = {
  [matchGoalsOverrideKey("masculino", matchId)]: {
    goals: [
      { teamSide: "home", playerKey: firstScorerId, minute: 12 },
      { teamSide: "home", playerKey: secondScorerId, minute: 67 },
    ],
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

const scoringContext = resolveQuinielaScoringContextForTeam(resources, RAI_TEAM_ID, new Map());
const matchOptions = scoringOptionsForMatch(scoringContext, avilesMatch);

const firstPrediction: Prediction = {
  matchId,
  matchday: 1,
  outcome: "1",
  goalsHome: 2,
  goalsAway: 0,
  scorerId: firstScorerId,
  scorer: "J. Santamaria",
  updatedAt: "2025-09-01T12:00:00.000Z",
};

const secondPrediction: Prediction = {
  ...firstPrediction,
  scorerId: secondScorerId,
  scorer: "S. Goleador",
};

if (!isScorerPredictionCorrect(avilesMatch, firstPrediction, matchOptions)) {
  console.error("FAIL: primer goleador debería acertar");
  process.exit(1);
}

if (!isScorerPredictionCorrect(avilesMatch, secondPrediction, matchOptions)) {
  console.error("FAIL: segundo goleador debería acertar (no solo el primero)");
  process.exit(1);
}

const wrongPrediction: Prediction = {
  ...firstPrediction,
  scorerId: "wrong-player",
  scorer: "Otro",
};

if (isScorerPredictionCorrect(avilesMatch, wrongPrediction, matchOptions)) {
  console.error("FAIL: goleador que no marcó no debería acertar");
  process.exit(1);
}

const pointsSecond = scorePredictionPoints(avilesMatch, secondPrediction, matchOptions);
if (pointsSecond !== 3) {
  console.error(`FAIL: pronóstico con segundo goleador esperaba 3 pts, got ${pointsSecond}`);
  process.exit(1);
}

console.log("OK: cualquier goleador del Avilés en el partido cuenta para la RAIniela");
