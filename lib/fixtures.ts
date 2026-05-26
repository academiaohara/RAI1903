import { matchdays, RAI_TEAM_ID, teams } from "@/data/mock";
import type { Match, Team } from "@/types";

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
