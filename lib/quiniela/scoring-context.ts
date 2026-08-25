import { RAI_TEAM_ID } from "@/data/mock";
import { getCmsRivalSquad } from "@/lib/cms/rival-squads-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getSquadBundle } from "@/lib/cms/season-bundles";
import { buildSquadFromImport, getImportedRivalSquad } from "@/lib/rival-squad-imports";
import { readMatchGoalsOverride } from "@/lib/match-goals";
import { isFeaturedTeamMatch } from "@/lib/quiniela";
import type { Match, Matchday } from "@/types";
import type { MatchGoalEntry } from "@/types/match-goals";
import type { SquadPlayer } from "@/types/squad";

export type QuinielaScoringContext = {
  supportedTeamId: string;
  squadByTeamId: Map<string, SquadPlayer[]>;
  goalsByMatchId: Map<string, MatchGoalEntry[]>;
};

function resolveTeamSquad(
  bundles: SeasonBundlesMap,
  teamId: string,
  teamName: string,
): SquadPlayer[] {
  if (teamId === RAI_TEAM_ID) {
    return getSquadBundle(bundles, "masculino")?.players ?? [];
  }

  const cms = getCmsRivalSquad(bundles, "masculino", teamId);
  const imported = cms ?? getImportedRivalSquad(teamId);
  if (!imported) return [];

  return buildSquadFromImport(
    {
      id: teamId,
      name: teamName,
      shortName: teamName,
      city: "",
      stadium: "",
      coach: "",
      founded: 0,
      crestInitials: teamName.slice(0, 3).toUpperCase(),
      colors: [],
      position: 0,
      form: [],
      stats: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      },
    },
    imported,
  );
}

export function buildQuinielaScoringContext(
  bundles: SeasonBundlesMap,
  matchdays: Matchday[],
  supportedTeamId: string | undefined = RAI_TEAM_ID,
  getOverride?: (key: string) => unknown,
): QuinielaScoringContext {
  const teamId = supportedTeamId || RAI_TEAM_ID;
  const squadByTeamId = new Map<string, SquadPlayer[]>();
  const goalsByMatchId = new Map<string, MatchGoalEntry[]>();

  for (const matchday of matchdays) {
    for (const match of matchday.matches) {
      if (!isFeaturedTeamMatch(match, teamId)) continue;

      if (!squadByTeamId.has(teamId)) {
        const teamName =
          match.homeTeamId === teamId ? match.homeTeam : match.awayTeam;
        squadByTeamId.set(teamId, resolveTeamSquad(bundles, teamId, teamName));
      }

      if (getOverride) {
        const payload = readMatchGoalsOverride(getOverride, "masculino", match.id);
        if (payload?.goals.length) {
          goalsByMatchId.set(match.id, payload.goals);
        }
      }
    }
  }

  if (!squadByTeamId.has(teamId)) {
    squadByTeamId.set(teamId, resolveTeamSquad(bundles, teamId, "Equipo"));
  }

  return { supportedTeamId: teamId, squadByTeamId, goalsByMatchId };
}

export function scoringOptionsForMatch(context: QuinielaScoringContext, match: Match) {
  if (!isFeaturedTeamMatch(match, context.supportedTeamId)) return undefined;
  return {
    goals: context.goalsByMatchId.get(match.id),
    squad: context.squadByTeamId.get(context.supportedTeamId) ?? [],
    supportedTeamId: context.supportedTeamId,
  };
}

export function getSupportedTeamSquad(context: QuinielaScoringContext): SquadPlayer[] {
  return context.squadByTeamId.get(context.supportedTeamId) ?? [];
}
