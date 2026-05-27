import { matchdays, RAI_FEM_TEAM_ID, RAI_TEAM_ID, teams, teamsFemenino } from "@/data/mock";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, ResultCode, Team } from "@/types";

export const getTeam = (teamId: string): Team | undefined => teams.find((team) => team.id === teamId);

export const getAvilesMatches = (): Match[] =>
  matchdays.flatMap((matchday) => matchday.matches).filter((match) => match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID);

export const getLatestAvilesMatches = (limit = 5): Match[] =>
  getAvilesMatches()
    .filter((match) => match.status === "finished")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

export const getUpcomingAvilesMatches = (limit = 5): Match[] =>
  getAvilesMatches()
    .filter((match) => match.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

export const getNextAvilesMatch = (): Match | undefined => getUpcomingAvilesMatches(1)[0];

export const getTeamMatches = (teamId: string): Match[] =>
  matchdays.flatMap((matchday) => matchday.matches).filter((match) => match.homeTeamId === teamId || match.awayTeamId === teamId);

const teamIdByGender: Record<PrimerEquipoGender, string> = {
  masculino: RAI_TEAM_ID,
  femenino: RAI_FEM_TEAM_ID,
};

export const getRaiTeamId = (gender: PrimerEquipoGender = "masculino") => teamIdByGender[gender];

export const getTeamsByGender = (gender: PrimerEquipoGender): Team[] => (gender === "femenino" ? teamsFemenino : teams);

export function getAvilesMatchResult(match: Match): ResultCode | null {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) return null;

  const raiId = RAI_TEAM_ID;
  const avilesHome = match.homeTeamId === raiId;
  const avilesAway = match.awayTeamId === raiId;
  if (!avilesHome && !avilesAway) return null;

  const avilesGoals = avilesHome ? match.homeScore : match.awayScore;
  const rivalGoals = avilesHome ? match.awayScore : match.homeScore;
  if (avilesGoals > rivalGoals) return "W";
  if (avilesGoals < rivalGoals) return "L";
  return "D";
}

export const getLatestAvilesMatchesByGender = (_gender: PrimerEquipoGender, limit = 5): Match[] => getLatestAvilesMatches(limit);

export const getUpcomingAvilesMatchesByGender = (_gender: PrimerEquipoGender, limit = 5): Match[] => getUpcomingAvilesMatches(limit);

export const getNextAvilesMatchByGender = (gender: PrimerEquipoGender): Match | undefined => getUpcomingAvilesMatchesByGender(gender, 1)[0];
