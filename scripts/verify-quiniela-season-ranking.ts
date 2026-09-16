/**
 * Verifica que el ranking global suma igual que los rankings por jornada.
 * Ejecutar: npx --yes tsx scripts/verify-quiniela-season-ranking.ts
 */
import type { Match, Matchday, Prediction } from "@/types";
import {
  scoreUserMatchday,
  sortRankingEntries,
  type QuinielaSeasonRankingEntry,
} from "@/lib/quiniela-ranking";
import { shouldCountQuinielaPoints } from "@/lib/quiniela";

function makeMatch(round: number, index: number, homeScore: number, awayScore: number): Match {
  const home = `team-${index * 2 + 1}`;
  const away = `team-${index * 2 + 2}`;
  return {
    id: `j${round}-${home}-${away}`,
    matchday: round,
    homeTeamId: home,
    awayTeamId: away,
    homeTeam: `Team ${index * 2 + 1}`,
    awayTeam: `Team ${index * 2 + 2}`,
    date: `2025-08-${String(round + 10).padStart(2, "0")}T18:00:00.000Z`,
    competition: "primera-rfef",
    venue: "",
    status: "finished",
    homeScore,
    awayScore,
  };
}

function makeMatchday(round: number): Matchday {
  return {
    round,
    matches: [0, 1].map((i) => makeMatch(round, i, i + 1, i)),
  };
}

function makePrediction(match: Match, outcome: "1" | "X" | "2"): Prediction {
  return {
    matchId: match.id,
    matchday: match.matchday,
    outcome,
    updatedAt: "2025-08-01T12:00:00.000Z",
  };
}

function predictionsForRound(
  predictions: Record<string, Prediction>,
  round: number,
): Record<string, Prediction> {
  return Object.fromEntries(
    Object.entries(predictions).filter(([, prediction]) => prediction.matchday === round),
  );
}

function aggregateSeasonRanking(
  matchdays: Matchday[],
  savedRoundsByUser: Map<string, Set<number>>,
  predictionsByUser: Map<string, Record<string, Prediction>>,
): QuinielaSeasonRankingEntry[] {
  const userIds = [...savedRoundsByUser.keys()];
  const entries = userIds.map((userId) => {
    const savedRounds = savedRoundsByUser.get(userId) ?? new Set();
    const allPredictions = predictionsByUser.get(userId) ?? {};
    let points = 0;
    let hits = 0;
    let roundsPlayed = 0;

    for (const matchday of matchdays) {
      if (!savedRounds.has(matchday.round)) continue;
      roundsPlayed += 1;
      const countPoints = shouldCountQuinielaPoints(matchday);
      const roundPredictions = predictionsForRound(allPredictions, matchday.round);
      const scored = scoreUserMatchday(matchday, roundPredictions, countPoints);
      points += scored.points;
      hits += scored.hits;
    }

    return {
      userId,
      handle: `@${userId}`,
      avatarUrl: null,
      submittedAt: "2025-08-01T12:00:00.000Z",
      points,
      hits,
      roundsPlayed,
    };
  });

  return sortRankingEntries(entries, true);
}

const matchdays = [1, 2, 3].map(makeMatchday);
const userId = "user-a";
const predictions: Record<string, Prediction> = {};

for (const matchday of matchdays) {
  for (const match of matchday.matches) {
    const outcome = match.homeScore! > match.awayScore! ? "1" : match.homeScore === match.awayScore ? "X" : "2";
    predictions[match.id] = makePrediction(match, outcome);
  }
}

const savedRoundsByUser = new Map([["user-a", new Set([1, 2, 3])]]);
const predictionsByUser = new Map([[userId, predictions]]);

const seasonEntry = aggregateSeasonRanking(matchdays, savedRoundsByUser, predictionsByUser)[0]!;
let roundSum = 0;

for (const matchday of matchdays) {
  const countPoints = shouldCountQuinielaPoints(matchday);
  const roundPredictions = predictionsForRound(predictions, matchday.round);
  roundSum += scoreUserMatchday(matchday, roundPredictions, countPoints).points;
}

if (seasonEntry.points !== roundSum) {
  console.error(`FAIL: season=${seasonEntry.points} roundSum=${roundSum}`);
  process.exit(1);
}

if (seasonEntry.roundsPlayed !== 3) {
  console.error(`FAIL: roundsPlayed=${seasonEntry.roundsPlayed}`);
  process.exit(1);
}

console.log(`OK: global ranking sums ${seasonEntry.points} pts across ${seasonEntry.roundsPlayed} jornadas`);
