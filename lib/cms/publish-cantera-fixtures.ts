import type { SupabaseClient } from "@supabase/supabase-js";
import type { InlineOverridesMap } from "@/lib/cms/inline-overrides";
import { fetchInlineOverridesWithClient } from "@/lib/cms/inline-overrides-server";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import { buildFilialMatchesFromFixtures } from "@/lib/cantera/filial-season-data";
import { resolveJuvenilCompetitionConfig } from "@/lib/cantera/juvenil-season-data";
import type { FilialFixturePartido, FilialFixturesBundle } from "@/lib/cms/filial-bundles";
import { resolveFilialCompetitionConfig } from "@/lib/cms/filial-bundles";
import { bundleMapKey, type SeasonBundleScope } from "@/lib/cms/season-bundles";
import { canteraMatchResultOverrideKey } from "@/lib/fixture-inline-keys";
import { spainDateInputValue, spainTimeInputValue } from "@/lib/match-kickoff-time";
import type { CompetitionSeasonId } from "@/data/mock";
import type { JornadaFixture } from "@/types/jornadas";

type CanteraFixtureOverride = Partial<JornadaFixture>;

function applyOverrideToPartido(
  partido: FilialFixturePartido,
  override: CanteraFixtureOverride | undefined,
): FilialFixturePartido {
  if (!override || Object.keys(override).length === 0) return partido;

  const next: FilialFixturePartido = { ...partido };

  if (override.homeTeamName !== undefined) next.local = override.homeTeamName;
  if (override.awayTeamName !== undefined) next.visitante = override.awayTeamName;

  if (override.date) {
    next.fecha = spainDateInputValue(override.date);
    const timeFromDate = spainTimeInputValue(override.date);
    if (override.kickoffTime !== undefined) {
      next.hora = override.kickoffTime || null;
    } else if (timeFromDate !== "00:00") {
      next.hora = timeFromDate;
    }
  } else if (override.kickoffTime !== undefined) {
    next.hora = override.kickoffTime || null;
  }

  if (override.status === "scheduled") {
    next.estado = "pendiente";
    next.goles_local = null;
    next.goles_visitante = null;
  } else if (override.status === "finished") {
    next.estado = "finalizado";
    next.goles_local = override.homeScore ?? partido.goles_local ?? 0;
    next.goles_visitante = override.awayScore ?? partido.goles_visitante ?? 0;
  } else if (override.homeScore !== undefined && override.awayScore !== undefined) {
    next.estado = "finalizado";
    next.goles_local = override.homeScore;
    next.goles_visitante = override.awayScore;
  }

  return next;
}

export function mergeCanteraFixturesWithOverrides(
  bundles: Record<string, unknown>,
  overrides: InlineOverridesMap,
  scope: CanteraCmsScope,
): FilialFixturesBundle | null {
  const raw = bundles[bundleMapKey(scope, "fixtures")] as FilialFixturesBundle | undefined;
  if (!raw?.jornadas?.length) return null;

  const config =
    scope === "juvenil" ? resolveJuvenilCompetitionConfig(bundles) : resolveFilialCompetitionConfig(bundles);
  const matches = buildFilialMatchesFromFixtures(raw, config);
  const matchesByJornada = new Map<number, typeof matches>();
  for (const match of matches) {
    const list = matchesByJornada.get(match.matchday) ?? [];
    list.push(match);
    matchesByJornada.set(match.matchday, list);
  }

  const getOverride = (matchId: string): CanteraFixtureOverride | undefined => {
    const key = canteraMatchResultOverrideKey(scope, matchId);
    return overrides[key] as CanteraFixtureOverride | undefined;
  };

  const jornadas = raw.jornadas.map((jornada) => {
    const jornadaMatches = matchesByJornada.get(jornada.jornada) ?? [];
    const partidos = jornada.partidos.map((partido, index) => {
      const match = jornadaMatches[index];
      const override = match ? getOverride(match.id) : undefined;
      return applyOverrideToPartido(partido, override);
    });
    return { ...jornada, partidos };
  });

  return { ...raw, jornadas };
}

async function upsertCanteraBundleWithClient(
  supabase: SupabaseClient,
  seasonId: string,
  scope: SeasonBundleScope,
  payload: FilialFixturesBundle,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("cms_season_bundles").upsert(
    {
      season_id: seasonId,
      scope,
      bundle_key: "fixtures",
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "season_id,scope,bundle_key" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function publishCanteraFixturesBundleFromOverrides(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  scope: CanteraCmsScope,
): Promise<{ ok: boolean; error?: string; jornadasUpdated?: number }> {
  const [bundles, overrides] = await Promise.all([
    fetchSeasonBundlesWithClient(supabase, seasonId),
    fetchInlineOverridesWithClient(supabase, seasonId),
  ]);

  const merged = mergeCanteraFixturesWithOverrides(bundles, overrides, scope);
  if (!merged) {
    return { ok: false, error: "No hay bundle de calendario (fixtures) para esta temporada." };
  }

  const result = await upsertCanteraBundleWithClient(supabase, seasonId, scope, merged);
  if (!result.ok) return result;

  return { ok: true, jornadasUpdated: merged.jornadas.length };
}
