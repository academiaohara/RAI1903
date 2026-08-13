import { matchdays as mockMatchdays, teams as mockTeams } from "@/data/mock";
import { buildActualStandingsByTeamId } from "@/lib/clasificacion-prediction";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { fetchInlineOverridesWithClient } from "@/lib/cms/inline-overrides-server";
import { fetchDefaultSeasonIdServer } from "@/lib/cms/seasons-server";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { buildLeagueMatchdaysFromBundles } from "@/lib/quiniela/build-matchdays";
import { getSiteOrigin } from "@/lib/auth/site-url";
import { buildCrestSpriteSheet, type CrestSpriteSheet } from "@/lib/clasificacion/og-crest";
import { getTeamCrestById } from "@/lib/team-crests";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { RAI_TEAM_ID } from "@/data/mock";
import type { Team } from "@/types";

export type ClasificacionOgRow = {
  position: number;
  teamId: string;
  name: string;
  crestIndex: number;
  crestInitials: string;
  points: number | null;
  isAviles: boolean;
};

export type ClasificacionOgShareData = {
  seasonLabel: string;
  rows: ClasificacionOgRow[];
  crestSprite: CrestSpriteSheet;
  hasStandings: boolean;
};

async function buildRows(
  teams: Team[],
  standings: Map<string, number>,
  cmsCrests: Record<string, string>,
  origin: string,
): Promise<Pick<ClasificacionOgShareData, "rows" | "crestSprite">> {
  const ordered =
    standings.size > 0
      ? [...teams].sort((a, b) => {
          const posA = standings.get(a.id) ?? 999;
          const posB = standings.get(b.id) ?? 999;
          return posA - posB || a.name.localeCompare(b.name, "es");
        })
      : [...teams].sort((a, b) => a.name.localeCompare(b.name, "es"));

  const crestPaths = ordered.map((team) => cmsCrests[team.id] ?? getTeamCrestById(team.id, team.crestInitials));
  const crestSprite = await buildCrestSpriteSheet(
    crestPaths,
    ordered.map((team) => ({
      initials: team.crestInitials || team.name.slice(0, 3).toUpperCase(),
      isAviles: team.id === RAI_TEAM_ID,
    })),
    origin,
  );

  const rows = ordered.map((team, index) => {
    const position = standings.get(team.id) ?? index + 1;
    return {
      position,
      teamId: team.id,
      name: team.name,
      crestIndex: index,
      crestInitials: team.crestInitials || team.name.slice(0, 3).toUpperCase(),
      points: team.stats.played > 0 ? team.stats.points : null,
      isAviles: team.id === RAI_TEAM_ID,
    };
  });

  return { rows, crestSprite };
}

export async function loadClasificacionOgShareData(): Promise<ClasificacionOgShareData> {
  const origin = getSiteOrigin();
  const seasonId = await fetchDefaultSeasonIdServer();
  const seasonLabel = seasonId.replace("-", "/");

  if (shouldUseMockCompetitionFallback()) {
    const standings = buildActualStandingsByTeamId(mockTeams, mockMatchdays);
    const { rows, crestSprite } = await buildRows(mockTeams, standings, {}, origin);
    return {
      seasonLabel,
      hasStandings: standings.size > 0,
      rows,
      crestSprite,
    };
  }

  const supabase = await createServerClient();
  const [bundles, inlineOverrides] = await Promise.all([
    fetchSeasonBundlesWithClient(supabase, seasonId),
    fetchInlineOverridesWithClient(supabase, seasonId),
  ]);
  const teams = resolveGroupTeams(bundles, "masculino", "1");
  const leagueMatchdays = buildLeagueMatchdaysFromBundles(bundles, inlineOverrides);
  const standings = buildActualStandingsByTeamId(teams, leagueMatchdays);
  const cmsCrests = getTeamCrestsBundle(bundles).crests;
  const { rows, crestSprite } = await buildRows(teams, standings, cmsCrests, origin);

  return {
    seasonLabel,
    hasStandings: standings.size > 0,
    rows,
    crestSprite,
  };
}
