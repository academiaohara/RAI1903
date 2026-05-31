import { getTeamByGender } from "@/lib/fixtures";
import type { FormCode, Team } from "@/types";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type CaraACaraTeamSide = {
  teamId: string;
  teamName: string;
  position: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  form: FormCode[];
  accent: "home" | "away";
  featuredPlayerName?: string;
  featuredPlayerPhoto?: string | null;
};

export type CaraACaraData = {
  home: CaraACaraTeamSide;
  away: CaraACaraTeamSide;
};

function teamToSide(team: Team, accent: "home" | "away"): CaraACaraTeamSide {
  return {
    teamId: team.id,
    teamName: team.name,
    position: team.position,
    points: team.stats.points,
    goalsFor: team.stats.goalsFor,
    goalsAgainst: team.stats.goalsAgainst,
    form: team.form.slice(-3),
    accent,
  };
}

export function buildCaraACaraData(
  homeTeamId: string,
  awayTeamId: string,
  gender: PrimerEquipoGender,
  options?: {
    homeFeatured?: { name: string; photo: string | null };
    awayFeatured?: { name: string; photo: string | null };
  },
): CaraACaraData | null {
  const homeTeam = getTeamByGender(homeTeamId, gender);
  const awayTeam = getTeamByGender(awayTeamId, gender);
  if (!homeTeam || !awayTeam) return null;

  return {
    home: {
      ...teamToSide(homeTeam, "home"),
      featuredPlayerName: options?.homeFeatured?.name,
      featuredPlayerPhoto: options?.homeFeatured?.photo ?? null,
    },
    away: {
      ...teamToSide(awayTeam, "away"),
      featuredPlayerName: options?.awayFeatured?.name,
      featuredPlayerPhoto: options?.awayFeatured?.photo ?? null,
    },
  };
}
