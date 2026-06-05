import { isLeagueCompetition } from "@/lib/competition-labels";
import { getTeamByGender } from "@/lib/fixtures";
import { getTeamsAtRound, leagueRoundForMatch } from "@/lib/standings";
import type { FormCode, Match, Matchday, Team } from "@/types";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type CaraACaraTeamSide = {
  teamId: string;
  teamName: string;
  position: number;
  played: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  form: FormCode[];
  accent: "home" | "away";
};

export type CaraACaraData = {
  home: CaraACaraTeamSide;
  away: CaraACaraTeamSide;
};

export type BuildCaraACaraOptions = {
  referenceMatch: Match;
  leagueMatchdays: Matchday[];
  sourceTeams: Team[];
};

function teamToSide(team: Team, accent: "home" | "away"): CaraACaraTeamSide {
  return {
    teamId: team.id,
    teamName: team.name,
    position: team.position,
    played: team.stats.played,
    points: team.stats.points,
    goalsFor: team.stats.goalsFor,
    goalsAgainst: team.stats.goalsAgainst,
    form: team.form.slice(-3),
    accent,
  };
}

function resolveTeamSide(
  teamId: string,
  fallbackName: string,
  teamsAtRound: Team[],
  sourceTeams: Team[],
  gender: PrimerEquipoGender,
  accent: "home" | "away",
): CaraACaraTeamSide {
  const team =
    teamsAtRound.find((entry) => entry.id === teamId) ??
    sourceTeams.find((entry) => entry.id === teamId) ??
    getTeamByGender(teamId, gender);

  if (!team) {
    return {
      teamId,
      teamName: fallbackName,
      position: 0,
      played: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      form: [],
      accent,
    };
  }

  return teamToSide({ ...team, name: team.name || fallbackName }, accent);
}

/** Estadísticas de liga antes de la jornada del partido de referencia (sin contar ese encuentro). */
export function buildCaraACaraData(
  homeTeamId: string,
  awayTeamId: string,
  gender: PrimerEquipoGender,
  options?: BuildCaraACaraOptions,
): CaraACaraData | null {
  if (options) {
    const { referenceMatch, leagueMatchdays, sourceTeams } = options;
    if (!isLeagueCompetition(referenceMatch.competition)) return null;

    const beforeRound = leagueRoundForMatch(referenceMatch);
    if (beforeRound <= 0) return null;

    const teamsAtRound = getTeamsAtRound(sourceTeams, leagueMatchdays, beforeRound);

    return {
      home: resolveTeamSide(
        homeTeamId,
        referenceMatch.homeTeam,
        teamsAtRound,
        sourceTeams,
        gender,
        "home",
      ),
      away: resolveTeamSide(
        awayTeamId,
        referenceMatch.awayTeam,
        teamsAtRound,
        sourceTeams,
        gender,
        "away",
      ),
    };
  }

  const homeTeam = getTeamByGender(homeTeamId, gender);
  const awayTeam = getTeamByGender(awayTeamId, gender);
  if (!homeTeam || !awayTeam) return null;

  return {
    home: teamToSide(homeTeam, "home"),
    away: teamToSide(awayTeam, "away"),
  };
}
