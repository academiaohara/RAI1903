import {
  bundleMapKey,
  type SeasonBundleScope,
  type SeasonBundlesMap,
} from "@/lib/cms/season-bundles";

export type SectionStatusKey = "plantilla" | "competicion" | "jornadas" | "calendario";

export type SeasonSectionStatusBundle = Partial<Record<SectionStatusKey, boolean>>;

export const SECTION_STATUS_KEYS: SectionStatusKey[] = [
  "plantilla",
  "competicion",
  "jornadas",
  "calendario",
];

export const SECTION_STATUS_LABELS: Record<SectionStatusKey, string> = {
  plantilla: "Plantilla",
  competicion: "Competición",
  jornadas: "Jornadas",
  calendario: "Calendario",
};

export const SECTION_STATUS_LABELS_CANtera: Partial<Record<SectionStatusKey, string>> = {
  competicion: "Clasificación",
};

export const SECTION_STATUS_SCOPE_LABELS: Record<SeasonBundleScope, string> = {
  masculino: "Primer equipo",
  femenino: "Femenino",
  filial: "Filial",
  juvenil: "Juvenil A",
  global: "Global",
};

export function getSectionStatusBundle(
  map: SeasonBundlesMap,
  scope: SeasonBundleScope,
): SeasonSectionStatusBundle {
  const payload = map[bundleMapKey(scope, "section_status")];
  return (payload as SeasonSectionStatusBundle | undefined) ?? {};
}

export function isSectionUnderConstruction(
  map: SeasonBundlesMap,
  scope: SeasonBundleScope,
  section: SectionStatusKey,
): boolean {
  return getSectionStatusBundle(map, scope)[section] === true;
}

export function sectionStatusLabel(scope: SeasonBundleScope, section: SectionStatusKey): string {
  if (scope === "filial" || scope === "juvenil") {
    return SECTION_STATUS_LABELS_CANtera[section] ?? SECTION_STATUS_LABELS[section];
  }
  return SECTION_STATUS_LABELS[section];
}
