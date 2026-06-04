import { buildMatchDetail } from "@/lib/match-detail";
import { getSquadBundle } from "@/lib/cms/season-bundles";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { isAvilesMatch } from "@/lib/quiniela";
import type { Match, Matchday } from "@/types";
import type { MatchEvent } from "@/types";
import type { SquadPlayer } from "@/types/squad";

export type QuinielaScoringContext = {
  squad: SquadPlayer[];
  eventsByMatchId: Map<string, MatchEvent[]>;
};

export function buildQuinielaScoringContext(
  bundles: SeasonBundlesMap,
  matchdays: Matchday[],
): QuinielaScoringContext {
  const squad = getSquadBundle(bundles, "masculino")?.players ?? [];
  const eventsByMatchId = new Map<string, MatchEvent[]>();

  for (const matchday of matchdays) {
    for (const match of matchday.matches) {
      if (!isAvilesMatch(match)) continue;
      eventsByMatchId.set(match.id, buildMatchDetail(match, "masculino").events);
    }
  }

  return { squad, eventsByMatchId };
}

export function scoringOptionsForMatch(context: QuinielaScoringContext, match: Match) {
  if (!isAvilesMatch(match)) return undefined;
  return {
    events: context.eventsByMatchId.get(match.id),
    squad: context.squad,
  };
}
