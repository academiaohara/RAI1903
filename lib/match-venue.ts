import { getRivalStadiumName } from "@/lib/cms/rival-squads-bundle";
import { resolveTeamCatalogEntry } from "@/lib/cms/resolve-team-catalog";
import { applyCmsTeamToBase, getTeamsBundle } from "@/lib/cms/teams-bundle";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { resolveEquipoLigaTeam } from "@/lib/equipo-liga-resolve";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, Matchday } from "@/types";

export function formatStadiumDisplayName(name: string): string {
  return name.trim().replace(/^Estadio\s+/i, "");
}

export type ResolveMatchVenueOptions = {
  bundles?: SeasonBundlesMap;
  seasonLabel?: string;
};

export function resolveHomeTeamStadiumName(
  homeTeamId: string,
  gender: PrimerEquipoGender,
  options?: ResolveMatchVenueOptions,
): string {
  if (options?.bundles) {
    const fromCatalog = resolveTeamCatalogEntry(homeTeamId, options.bundles, gender).stadium.trim();
    if (fromCatalog) return formatStadiumDisplayName(fromCatalog);
  }

  const cmsRecord = options?.bundles
    ? getTeamsBundle(options.bundles, gender)?.teams.find((team) => team.id === homeTeamId)
    : undefined;
  const baseTeam = resolveEquipoLigaTeam(homeTeamId, gender, options?.bundles);
  const team = baseTeam ? applyCmsTeamToBase(baseTeam, cmsRecord) : undefined;

  const fromTeam = team?.stadium?.trim();
  if (fromTeam) return formatStadiumDisplayName(fromTeam);

  if (team) {
    const squad = getCompeticionSquadData(gender, team, options?.bundles, options?.seasonLabel);
    const fromClub = squad.club.estadio?.trim() || squad.club.estadioInfo?.nombre?.trim();
    if (fromClub) return formatStadiumDisplayName(fromClub);
  }

  const fromRivalBundle = getRivalStadiumName(options?.bundles, gender, homeTeamId);
  if (fromRivalBundle) return formatStadiumDisplayName(fromRivalBundle);

  return "";
}

export function resolveMatchVenue(
  match: Pick<Match, "venue" | "homeTeamId">,
  gender: PrimerEquipoGender,
  options?: ResolveMatchVenueOptions,
): string {
  const explicit = match.venue?.trim();
  if (explicit) return formatStadiumDisplayName(explicit);
  return resolveHomeTeamStadiumName(match.homeTeamId, gender, options);
}

export function enrichMatchVenue<T extends Match>(
  match: T,
  gender: PrimerEquipoGender,
  options?: ResolveMatchVenueOptions,
): T {
  if (match.venue?.trim()) return match;
  const venue = resolveMatchVenue(match, gender, options);
  if (!venue) return match;
  return { ...match, venue };
}

export function enrichMatchdaysVenues(
  matchdays: Matchday[],
  gender: PrimerEquipoGender,
  options?: ResolveMatchVenueOptions,
): Matchday[] {
  return matchdays.map((matchday) => ({
    ...matchday,
    matches: matchday.matches.map((match) => enrichMatchVenue(match, gender, options)),
  }));
}

export function enrichFixtureMatchesVenues(
  matches: Match[],
  gender: PrimerEquipoGender,
  options?: ResolveMatchVenueOptions,
): Match[] {
  return matches.map((match) => enrichMatchVenue(match, gender, options));
}
