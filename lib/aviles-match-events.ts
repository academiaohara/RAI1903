import { RAI_TEAM_ID } from "@/data/mock";
import { resolveSquadPlayerByName, scorerLabelForPlayer } from "@/lib/squad-player-resolve";
import type { Match, MatchEvent } from "@/types";
import type { SquadPlayer } from "@/types/squad";

export function getAvilesScorerFromEvents(
  match: Match,
  events: MatchEvent[],
  squad: SquadPlayer[],
): string | null {
  const isHome = match.homeTeamId === RAI_TEAM_ID;
  const isAway = match.awayTeamId === RAI_TEAM_ID;
  if (!isHome && !isAway) return null;

  const avilesSide: "home" | "away" = isHome ? "home" : "away";
  const goals = events
    .filter((event) => event.type === "goal" && event.team === avilesSide && event.player.trim())
    .sort((a, b) => a.minute - b.minute);

  if (goals.length === 0) {
    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    const avilesGoals = isHome ? homeScore : awayScore;
    return avilesGoals === 0 ? "nadie" : null;
  }

  const firstGoal = goals[0]!;
  const player = resolveSquadPlayerByName(squad, firstGoal.player);
  if (player) return scorerLabelForPlayer(player);

  return firstGoal.player.trim();
}
