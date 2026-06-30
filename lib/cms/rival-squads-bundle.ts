import { bundleMapKey, type SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RivalSquadImport } from "@/types/rival-squad-import";

export type SeasonRivalSquadsBundle = {
  squads: Record<string, RivalSquadImport>;
};

export function getRivalSquadsBundle(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): SeasonRivalSquadsBundle {
  const payload = bundles[bundleMapKey(gender, "rival_squads")] as SeasonRivalSquadsBundle | undefined;
  return payload?.squads ? { squads: { ...payload.squads } } : { squads: {} };
}

export function getCmsRivalSquad(
  bundles: SeasonBundlesMap | undefined,
  gender: PrimerEquipoGender,
  teamId: string,
): RivalSquadImport | null {
  if (!bundles) return null;
  const squad = getRivalSquadsBundle(bundles, gender).squads[teamId];
  if (!squad?.plantilla?.length) return null;
  return squad;
}

export function getRivalStadiumName(
  bundles: SeasonBundlesMap | undefined,
  gender: PrimerEquipoGender,
  teamId: string,
): string {
  if (!bundles) return "";
  const squad = getRivalSquadsBundle(bundles, gender).squads[teamId];
  if (!squad) return "";
  return squad.estadioInfo?.nombre?.trim() || squad.estadio?.trim() || "";
}

export function withRivalSquadInBundle(
  bundle: SeasonRivalSquadsBundle,
  teamId: string,
  squad: RivalSquadImport,
): SeasonRivalSquadsBundle {
  return {
    squads: {
      ...bundle.squads,
      [teamId]: squad,
    },
  };
}
