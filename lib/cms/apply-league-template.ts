import { configFromTemplate, getLeagueTemplate, type LeagueTemplateId } from "@/lib/competition/league-templates";
import {
  resolveMatchCompetition,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import {
  getFixturesBundle,
  upsertSeasonBundle,
  type SeasonFixturesBundle,
  type SeasonFemeninoFixturesBundle,
} from "@/lib/cms/season-bundles";
import { defaultGroupTeamSlots, withGroupTeamsInConfig } from "@/lib/cms/group-teams";
import { normalizeGrupo2Matchdays, normalizeLeagueMatchdays } from "@/lib/competition/normalize-fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";

function configWithDefaultGroupTeams(
  config: SeasonCompetitionConfigBundle,
  gender: PrimerEquipoGender,
): SeasonCompetitionConfigBundle {
  const grupos: RfefGrupoId[] = config.groupCount >= 2 ? ["1", "2"] : ["1"];
  return grupos.reduce(
    (current, grupo) =>
      withGroupTeamsInConfig(
        current,
        grupo,
        defaultGroupTeamSlots(grupo, gender, config.teamsPerGroup, config),
      ),
    config,
  );
}

export type ApplyLeagueTemplateOptions = {
  /** Si true, regenera calendario vacío según la plantilla. */
  regenerateFixtures?: boolean;
  /** Bundles actuales (para conservar amistosos / copa al regenerar masculino). */
  bundles?: SeasonBundlesMap;
};

export function buildFixturesPayloadForConfig(
  gender: PrimerEquipoGender,
  config: SeasonCompetitionConfigBundle,
  bundles: SeasonBundlesMap,
): SeasonFixturesBundle | SeasonFemeninoFixturesBundle {
  const competition = resolveMatchCompetition(config);
  const emptySource = { matchdays: [], matchdaysGrupo2: [], matchdaysFemenino: [] };

  if (gender === "femenino") {
    const matchdaysFemenino = normalizeLeagueMatchdays(emptySource.matchdaysFemenino, config, competition);
    return {
      matchdaysFemenino,
      meta: { lastRound: 0 },
    };
  }

  const matchdays = normalizeLeagueMatchdays(emptySource.matchdays, config, competition);
  const matchdaysGrupo2 =
    config.groupCount >= 2
      ? normalizeGrupo2Matchdays(emptySource.matchdaysGrupo2, config, competition)
      : undefined;
  const existing = getFixturesBundle(bundles, gender) as SeasonFixturesBundle | null;
  return {
    matchdays,
    matchdaysGrupo2,
    amistosoMatches: existing?.amistosoMatches,
    copaDelReyMatches: existing?.copaDelReyMatches,
    meta: { lastRound: 0, definitiveQualifyingLeagueRound: 0 },
  };
}

export async function applyLeagueTemplate(
  seasonId: string,
  templateId: LeagueTemplateId,
  options: ApplyLeagueTemplateOptions = {},
): Promise<{ ok: boolean; error?: string }> {
  const template = getLeagueTemplate(templateId);
  if (!template) {
    return { ok: false, error: "Plantilla no encontrada" };
  }

  const config = configWithDefaultGroupTeams(configFromTemplate(template), template.gender);
  const gender = template.gender;
  const bundles = options.bundles ?? {};

  const configResult = await upsertSeasonBundle(seasonId, gender, "competition_config", config);
  if (!configResult.ok) return configResult;

  if (options.regenerateFixtures !== false) {
    const payload = buildFixturesPayloadForConfig(gender, config, bundles);
    const fixturesResult = await upsertSeasonBundle(seasonId, gender, "fixtures", payload);
    if (!fixturesResult.ok) return fixturesResult;
  }

  return { ok: true };
}

export async function createSeasonWithLeagueTemplates(
  input: { id: string; label: string; published?: boolean },
  templates: Partial<Record<PrimerEquipoGender, LeagueTemplateId>>,
): Promise<{ ok: boolean; error?: string }> {
  const { createSeason } = await import("@/lib/cms/seasons-editor");
  const created = await createSeason(input);
  if (!created.ok) return created;

  for (const gender of ["masculino", "femenino"] as const) {
    const templateId = templates[gender];
    if (!templateId) continue;
    const applied = await applyLeagueTemplate(input.id, templateId, { regenerateFixtures: true });
    if (!applied.ok) return applied;
  }

  return { ok: true };
}
