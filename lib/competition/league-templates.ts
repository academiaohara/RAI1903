import type { SeasonCompetitionConfigBundle } from "@/lib/cms/competition-config-bundle";
import { DEFAULT_ZONE_COLORS } from "@/lib/cms/competition-config-bundle";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CompetitionId } from "@/types";

export type LeagueTemplateId =
  | "primera-rfef-2x20"
  | "segunda-division-22"
  | "segunda-rfef-1x18"
  | "segunda-rfef-femenina-14";

export type LeagueTemplate = {
  id: LeagueTemplateId;
  label: string;
  description: string;
  gender: PrimerEquipoGender;
  config: SeasonCompetitionConfigBundle;
  /** Etiqueta por defecto en Competición / Jornadas (editable después). */
  ligaLabel: string;
  matchCompetition: CompetitionId;
};

function zonesPrimeraRfef(): SeasonCompetitionConfigBundle["zones"] {
  return [
    {
      id: "promotion",
      label: "Ascenso directo",
      count: 1,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.promotion,
    },
    {
      id: "playoff",
      label: "Playoff",
      count: 4,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.playoff,
    },
    {
      id: "relegation",
      label: "Descenso",
      count: 5,
      from: "bottom",
      colorClass: DEFAULT_ZONE_COLORS.relegation,
    },
  ];
}

function zonesSegundaDivision(): SeasonCompetitionConfigBundle["zones"] {
  return [
    {
      id: "promotion",
      label: "Ascenso directo",
      count: 2,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.promotion,
    },
    {
      id: "playoff",
      label: "Playoff ascenso",
      count: 4,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.playoff,
    },
    {
      id: "relegation",
      label: "Descenso",
      count: 4,
      from: "bottom",
      colorClass: DEFAULT_ZONE_COLORS.relegation,
    },
  ];
}

function zonesSegundaRfef(): SeasonCompetitionConfigBundle["zones"] {
  return [
    {
      id: "promotion",
      label: "Ascenso directo",
      count: 1,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.promotion,
    },
    {
      id: "playoff",
      label: "Playoff",
      count: 4,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.playoff,
    },
    {
      id: "relegation",
      label: "Descenso",
      count: 5,
      from: "bottom",
      colorClass: DEFAULT_ZONE_COLORS.relegation,
    },
    {
      id: "playout",
      label: "Playout",
      count: 1,
      from: "bottom",
      colorClass: DEFAULT_ZONE_COLORS.playout,
    },
  ];
}

function zonesFemenina(): SeasonCompetitionConfigBundle["zones"] {
  return [
    {
      id: "promotion",
      label: "Ascenso",
      count: 1,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.promotion,
    },
    {
      id: "playoff",
      label: "Playoff",
      count: 4,
      from: "top",
      colorClass: DEFAULT_ZONE_COLORS.playoff,
    },
    {
      id: "relegation",
      label: "Descenso",
      count: 4,
      from: "bottom",
      colorClass: DEFAULT_ZONE_COLORS.relegation,
    },
  ];
}

export const LEAGUE_TEMPLATES: LeagueTemplate[] = [
  {
    id: "primera-rfef-2x20",
    label: "1ª RFEF",
    description: "2 grupos × 20 equipos · playoff ascenso RFEF entre grupos",
    gender: "masculino",
    ligaLabel: "1ª RFEF",
    matchCompetition: "primera-rfef",
    config: {
      templateId: "primera-rfef-2x20",
      teamsPerGroup: 20,
      groupCount: 2,
      zones: zonesPrimeraRfef(),
      hasPlayoff: true,
    },
  },
  {
    id: "segunda-division-22",
    label: "Segunda División",
    description: "LFP · 22 equipos · 2 ascensos directos · playoff 3º–6º · 4 descensos",
    gender: "masculino",
    ligaLabel: "Segunda División",
    matchCompetition: "primera-rfef",
    config: {
      templateId: "segunda-division-22",
      teamsPerGroup: 22,
      groupCount: 1,
      zones: zonesSegundaDivision(),
      hasPlayoff: false,
    },
  },
  {
    id: "segunda-rfef-1x18",
    label: "2ª RFEF (un grupo)",
    description: "1 grupo × 18 · 1 ascenso · playoff · playout (14º) · 5 descensos",
    gender: "masculino",
    ligaLabel: "2ª RFEF",
    matchCompetition: "primera-rfef",
    config: {
      templateId: "segunda-rfef-1x18",
      teamsPerGroup: 18,
      groupCount: 1,
      zones: zonesSegundaRfef(),
      hasPlayoff: false,
    },
  },
  {
    id: "segunda-rfef-femenina-14",
    label: "2ª RFEF Femenina",
    description: "1 grupo × 14 equipos",
    gender: "femenino",
    ligaLabel: "2ª RFEF Femenina",
    matchCompetition: "liga-femenina",
    config: {
      templateId: "segunda-rfef-femenina-14",
      teamsPerGroup: 14,
      groupCount: 1,
      zones: zonesFemenina(),
      hasPlayoff: false,
    },
  },
];

export function getLeagueTemplate(id: LeagueTemplateId): LeagueTemplate | undefined {
  return LEAGUE_TEMPLATES.find((t) => t.id === id);
}

export function leagueTemplatesForGender(gender: PrimerEquipoGender): LeagueTemplate[] {
  return LEAGUE_TEMPLATES.filter((t) => t.gender === gender);
}

export function configFromTemplate(template: LeagueTemplate): SeasonCompetitionConfigBundle {
  return {
    ...template.config,
    ligaLabel: template.ligaLabel,
    matchCompetition: template.matchCompetition,
  };
}
