import type { GroupTeamSlot } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { bundleMapKey } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import { PRIMERA_RFEF_STANDINGS_ZONES } from "@/lib/rfef-rules/config";
import { FEMENINA_STANDINGS_ZONES } from "@/lib/segunda-rfef-femenina-2526";
import type { StandingsZonesConfig } from "@/lib/standings";
import type { CompetitionId } from "@/types";
import type { LeagueTemplateId } from "@/lib/competition/league-templates";

/** Regla de zona en clasificación (ascenso, playoff, descenso, etc.). */
export type CompetitionZoneRule = {
  id: string;
  label: string;
  /** Cuántas plazas ocupa la zona. */
  count: number;
  from: "top" | "bottom";
  /** Clase Tailwind de fondo, p. ej. bg-emerald-500 */
  colorClass: string;
};

export type SeasonCompetitionConfigBundle = {
  /** Equipos por grupo (p. ej. 20 en 1ª RFEF). */
  teamsPerGroup: number;
  groupCount: 1 | 2;
  zones: CompetitionZoneRule[];
  /** @deprecated Ignorado: los playoffs se gestionan en calendario, no en jornadas. */
  hasPlayoff?: boolean;
  /** Plantilla aplicada por última vez (referencia; los valores editables mandan). */
  templateId?: LeagueTemplateId;
  /** Etiqueta por defecto de la liga en la web. */
  ligaLabel?: string;
  /** Valor `competition` en partidos placeholder generados. */
  matchCompetition?: CompetitionId;
  /** Plazas del grupo editables desde la guía de la liga. */
  groupTeams?: Partial<Record<RfefGrupoId, GroupTeamSlot[]>>;
};

/** Muestra selector Grupo I / II cuando hay más de un grupo. */
export function hasMultipleGrupos(config: SeasonCompetitionConfigBundle): boolean {
  return config.groupCount >= 2;
}

export function resolveMatchCompetition(
  config: SeasonCompetitionConfigBundle,
  gender: PrimerEquipoGender = "masculino",
): CompetitionId {
  if (config.matchCompetition) return config.matchCompetition;
  return gender === "femenino" ? "liga-femenina" : "primera-rfef";
}

export const DEFAULT_ZONE_COLORS = {
  promotion: "bg-emerald-500",
  playoff: "bg-sky-400",
  playout: "bg-amber-500",
  relegation: "bg-rose-500",
} as const;

function defaultZonesFromLegacy(config: StandingsZonesConfig): CompetitionZoneRule[] {
  const rules: CompetitionZoneRule[] = [];
  if (config.promotion > 0) {
    rules.push({
      id: "promotion",
      label: "Ascenso directo",
      count: config.promotion,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.promotion,
    });
  }
  if (config.playoff > 0) {
    rules.push({
      id: "playoff",
      label: "Playoff",
      count: config.playoff,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.playoff,
    });
  }
  if (config.relegation > 0) {
    rules.push({
      id: "relegation",
      label: "Descenso",
      count: config.relegation,
      from: "bottom",
      colorClass: DEFAULT_ZONE_COLORS.relegation,
    });
  }
  return rules;
}

export function defaultCompetitionConfig(gender: PrimerEquipoGender): SeasonCompetitionConfigBundle {
  const legacy = gender === "femenino" ? FEMENINA_STANDINGS_ZONES : PRIMERA_RFEF_STANDINGS_ZONES;
  const teamsPerGroup = gender === "femenino" ? 14 : 20;
  return {
    teamsPerGroup,
    groupCount: gender === "masculino" ? 2 : 1,
    zones: defaultZonesFromLegacy(legacy),
    ...(gender === "femenino"
      ? { ligaLabel: "2ª RFEF Femenina", matchCompetition: "liga-femenina" as CompetitionId }
      : {}),
  };
}

export function leagueRoundCount(teamsPerGroup: number): number {
  return Math.max(0, (teamsPerGroup - 1) * 2);
}

export function matchesPerLeagueRound(teamsPerGroup: number): number {
  return Math.max(1, Math.floor(teamsPerGroup / 2));
}

export function getCompetitionConfigBundle(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): SeasonCompetitionConfigBundle | null {
  const payload = bundles[bundleMapKey(gender, "competition_config")];
  return (payload as SeasonCompetitionConfigBundle | undefined) ?? null;
}

export function resolveCompetitionConfig(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): SeasonCompetitionConfigBundle {
  return getCompetitionConfigBundle(bundles, gender) ?? defaultCompetitionConfig(gender);
}

export function zonesToLegacyConfig(zones: CompetitionZoneRule[]): StandingsZonesConfig {
  let promotion = 0;
  let playoff = 0;
  let relegation = 0;
  for (const zone of zones) {
    if (zone.from === "top") {
      if (zone.id === "promotion" || promotion === 0) promotion += zone.count;
      else playoff += zone.count;
    } else if (zone.id !== "playout") {
      relegation += zone.count;
    }
  }
  return { promotion, playoff, relegation };
}
