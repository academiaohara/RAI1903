import type { InlineOverridesMap } from "@/lib/cms/inline-overrides";
import {
  getFixturesBundle,
  type SeasonFemeninoFixturesBundle,
  type SeasonFixturesBundle,
  type SeasonBundlesMap,
} from "@/lib/cms/season-bundles";
import { applyMatchInlineOverride, applyMatchdayOverrides } from "@/lib/fixture-overrides";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";

function applyMatchesOverrides(
  matches: Match[],
  getOverride: (key: string) => unknown,
  gender: PrimerEquipoGender,
): Match[] {
  return matches.map((match) => applyMatchInlineOverride(match, getOverride, gender));
}

/** Fusiona cms_inline_overrides en el payload del bundle fixtures (misma lógica que Jornadas en pantalla). */
export function mergeFixtureBundleWithOverrides(
  bundles: SeasonBundlesMap,
  overrides: InlineOverridesMap,
  gender: PrimerEquipoGender,
): SeasonFixturesBundle | SeasonFemeninoFixturesBundle | null {
  const raw = getFixturesBundle(bundles, gender);
  if (!raw) return null;

  const getOverride = (key: string) => overrides[key];

  if (gender === "femenino") {
    const bundle = raw as SeasonFemeninoFixturesBundle;
    return {
      ...bundle,
      matchdaysFemenino: applyMatchdayOverrides(bundle.matchdaysFemenino ?? [], getOverride, gender),
      amistosoMatches: bundle.amistosoMatches
        ? applyMatchesOverrides(bundle.amistosoMatches, getOverride, gender)
        : bundle.amistosoMatches,
      calendarExtraMatches: bundle.calendarExtraMatches
        ? applyMatchesOverrides(bundle.calendarExtraMatches, getOverride, gender)
        : bundle.calendarExtraMatches,
    };
  }

  const bundle = raw as SeasonFixturesBundle;
  return {
    ...bundle,
    matchdays: applyMatchdayOverrides(bundle.matchdays ?? [], getOverride, gender),
    matchdaysGrupo2: bundle.matchdaysGrupo2
      ? applyMatchdayOverrides(bundle.matchdaysGrupo2, getOverride, gender)
      : bundle.matchdaysGrupo2,
    amistosoMatches: bundle.amistosoMatches
      ? applyMatchesOverrides(bundle.amistosoMatches, getOverride, gender)
      : bundle.amistosoMatches,
    copaDelReyMatches: bundle.copaDelReyMatches
      ? applyMatchesOverrides(bundle.copaDelReyMatches, getOverride, gender)
      : bundle.copaDelReyMatches,
    calendarExtraMatches: bundle.calendarExtraMatches
      ? applyMatchesOverrides(bundle.calendarExtraMatches, getOverride, gender)
      : bundle.calendarExtraMatches,
  };
}
