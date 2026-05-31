import {
  amistosoMatches,
  copaDelReyMatches,
  matchdays,
  matchdaysFemenino,
  RAI_FEM_TEAM_ID,
  RAI_TEAM_ID,
  teams,
  teamsFemenino,
  teamsGrupo2,
} from "@/data/mock";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, ResultCode, Team } from "@/types";

export const getTeam = (teamId: string): Team | undefined =>
  teams.find((team) => team.id === teamId) ??
  teamsGrupo2.find((team) => team.id === teamId) ??
  teamsFemenino.find((team) => team.id === teamId);

export const getTeamByGender = (teamId: string, gender: PrimerEquipoGender): Team | undefined => {
  if (gender === "femenino") {
    return teamsFemenino.find((team) => team.id === teamId);
  }
  return teams.find((team) => team.id === teamId) ?? teamsGrupo2.find((team) => team.id === teamId);
};

export const getAllTeamsForGender = (gender: PrimerEquipoGender): Team[] =>
  gender === "femenino" ? teamsFemenino : [...teams, ...teamsGrupo2];

function leagueMatchesForGender(gender: PrimerEquipoGender): Match[] {
  if (gender === "femenino") {
    return matchdaysFemenino.flatMap((matchday) => matchday.matches);
  }
  return matchdays.flatMap((matchday) => matchday.matches);
}

const masculinoNonLeagueMatches = [...amistosoMatches, ...copaDelReyMatches];

export const getAvilesMatchesByGender = (gender: PrimerEquipoGender): Match[] => {
  const raiId = getRaiTeamId(gender);
  const source =
    gender === "femenino"
      ? leagueMatchesForGender(gender)
      : [...leagueMatchesForGender(gender), ...masculinoNonLeagueMatches];
  return source.filter((match) => match.homeTeamId === raiId || match.awayTeamId === raiId);
};

export const getAvilesMatches = (): Match[] => getAvilesMatchesByGender("masculino");

export const getLatestAvilesMatches = (limit = 5): Match[] =>
  getLatestAvilesMatchesByGender("masculino", limit);

export const getUpcomingAvilesMatches = (limit = 5): Match[] =>
  getUpcomingAvilesMatchesByGender("masculino", limit);

export const getNextAvilesMatch = (): Match | undefined => getUpcomingAvilesMatches(1)[0];

export const getAmistosoMatchesByGender = (gender: PrimerEquipoGender): Match[] =>
  gender === "masculino"
    ? [...amistosoMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

export const getTeamMatches = (teamId: string): Match[] => {
  const masculino = [...matchdays.flatMap((matchday) => matchday.matches), ...masculinoNonLeagueMatches].filter(
    (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
  );
  if (masculino.length > 0) return masculino;

  return matchdaysFemenino
    .flatMap((matchday) => matchday.matches)
    .filter((match) => match.homeTeamId === teamId || match.awayTeamId === teamId);
};

export const getCopaDelReyMatchesByGender = (gender: PrimerEquipoGender): Match[] =>
  gender === "masculino"
    ? [...copaDelReyMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

const teamIdByGender: Record<PrimerEquipoGender, string> = {
  masculino: RAI_TEAM_ID,
  femenino: RAI_FEM_TEAM_ID,
};

export const getRaiTeamId = (gender: PrimerEquipoGender = "masculino") => teamIdByGender[gender];

export const getTeamsByGender = (gender: PrimerEquipoGender): Team[] => (gender === "femenino" ? teamsFemenino : teams);

export function getAvilesMatchResult(match: Match, gender: PrimerEquipoGender = "masculino"): ResultCode | null {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) return null;

  const raiId = getRaiTeamId(gender);
  const avilesHome = match.homeTeamId === raiId;
  const avilesAway = match.awayTeamId === raiId;
  if (!avilesHome && !avilesAway) return null;

  const avilesGoals = avilesHome ? match.homeScore : match.awayScore;
  const rivalGoals = avilesHome ? match.awayScore : match.homeScore;
  if (avilesGoals > rivalGoals) return "W";
  if (avilesGoals < rivalGoals) return "L";
  return "D";
}

export const getLatestAvilesMatchesByGender = (gender: PrimerEquipoGender, limit = 5): Match[] =>
  getAvilesMatchesByGender(gender)
    .filter((match) => match.status === "finished")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

export const getUpcomingAvilesMatchesByGender = (gender: PrimerEquipoGender, limit = 5): Match[] =>
  getAvilesMatchesByGender(gender)
    .filter((match) => match.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

export const getNextAvilesMatchByGender = (gender: PrimerEquipoGender): Match | undefined =>
  getUpcomingAvilesMatchesByGender(gender, 1)[0];

export function getMatchById(matchId: string): Match | undefined {
  return [
    ...matchdays.flatMap((round) => round.matches),
    ...matchdaysFemenino.flatMap((round) => round.matches),
    ...masculinoNonLeagueMatches,
  ].find((match) => match.id === matchId);
}
