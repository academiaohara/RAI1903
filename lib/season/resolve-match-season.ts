import type { CompetitionSeasonId } from "@/data/mock";
import type { CmsSeason } from "@/lib/cms/seasons";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { findMatchInBundles } from "@/lib/season/find-match-in-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export function findSeasonIdsForMatchInBundles(
  bundlesBySeason: Partial<Record<CompetitionSeasonId, SeasonBundlesMap>>,
  matchId: string,
  gender: PrimerEquipoGender,
): CompetitionSeasonId[] {
  const found: CompetitionSeasonId[] = [];

  for (const [seasonId, bundles] of Object.entries(bundlesBySeason)) {
    if (!bundles || Object.keys(bundles).length === 0) continue;
    if (findMatchInBundles(bundles, matchId, { gender })) {
      found.push(seasonId as CompetitionSeasonId);
    }
  }

  return found;
}

export function pickCanonicalSeasonIdForMatch(
  candidates: CompetitionSeasonId[],
  seasons: CmsSeason[],
  activeSeasonId: CompetitionSeasonId,
  viewedSeasonId: CompetitionSeasonId,
): CompetitionSeasonId | null {
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];

  if (candidates.includes(activeSeasonId)) return activeSeasonId;
  if (candidates.includes(viewedSeasonId)) return viewedSeasonId;

  const sorted = seasons
    .filter((season) => candidates.includes(season.id as CompetitionSeasonId))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (sorted[0]?.id ?? candidates[0]) as CompetitionSeasonId;
}
