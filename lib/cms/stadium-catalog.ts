import { listStadiumAssets } from "@/lib/stadium-assets";
import { fetchEditorSeasons } from "@/lib/cms/seasons-editor";
import {
  bundleMapKey,
  fetchSeasonBundles,
  getSquadBundle,
  upsertSeasonBundle,
  type SeasonBundlesMap,
} from "@/lib/cms/season-bundles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { StadiumInfo } from "@/types/squad";

export type StadiumCatalogEntry = StadiumInfo & {
  id: string;
  /** Temporada de origen (si se conoce). */
  seasonLabel?: string;
  /** Equipo asociado en esa temporada. */
  teamLabel?: string;
};

export type StadiumCatalogBundle = {
  entries: StadiumCatalogEntry[];
};

function stadiumEntryKey(info: Pick<StadiumInfo, "nombre" | "imagen">): string {
  return `${info.nombre.trim().toLowerCase()}|${info.imagen.trim()}`;
}

function catalogEntryFromStadium(
  info: StadiumInfo,
  meta?: { seasonLabel?: string; teamLabel?: string },
): StadiumCatalogEntry {
  return {
    id: stadiumEntryKey(info),
    ...info,
    seasonLabel: meta?.seasonLabel,
    teamLabel: meta?.teamLabel,
  };
}

function mergeEntries(target: Map<string, StadiumCatalogEntry>, entry: StadiumCatalogEntry) {
  const existing = target.get(entry.id);
  if (!existing) {
    target.set(entry.id, entry);
    return;
  }
  target.set(entry.id, {
    ...existing,
    ...entry,
    seasonLabel: existing.seasonLabel ?? entry.seasonLabel,
    teamLabel: existing.teamLabel ?? entry.teamLabel,
  });
}

export function getStadiumCatalogFromBundles(map: SeasonBundlesMap): StadiumCatalogEntry[] {
  const payload = map[bundleMapKey("global", "stadium_photos")] as StadiumCatalogBundle | undefined;
  return payload?.entries ?? [];
}

export async function fetchStadiumCatalogEntries(): Promise<StadiumCatalogEntry[]> {
  const merged = new Map<string, StadiumCatalogEntry>();

  for (const asset of listStadiumAssets()) {
    const info: StadiumInfo = {
      nombre: asset.slug.replace(/-/g, " "),
      imagen: asset.path,
      capacidad: 0,
      direccion: "",
      ciudad: "",
      inaugurado: 0,
      superficie: "Césped natural",
    };
    mergeEntries(merged, catalogEntryFromStadium(info, { teamLabel: asset.slug }));
  }

  if (!isSupabaseConfigured()) {
    return Array.from(merged.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }

  const seasons = await fetchEditorSeasons();
  for (const season of seasons) {
    const bundles = await fetchSeasonBundles(season.id);
    for (const entry of getStadiumCatalogFromBundles(bundles)) {
      mergeEntries(merged, entry);
    }

    for (const gender of ["masculino", "femenino"] as const) {
      const squad = getSquadBundle(bundles, gender);
      const info = squad?.clubInfo?.estadioInfo;
      if (!info?.nombre) continue;
      mergeEntries(
        merged,
        catalogEntryFromStadium(info, {
          seasonLabel: season.label,
          teamLabel: squad?.clubInfo?.nombre ?? gender,
        }),
      );
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export async function upsertStadiumCatalogEntry(entry: StadiumCatalogEntry): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const seasons = await fetchEditorSeasons();
  const anchorSeasonId = seasons.find((row) => row.isDefault)?.id ?? seasons[0]?.id;
  if (!anchorSeasonId) {
    return { ok: false, error: "No hay temporadas para guardar el catálogo" };
  }

  const bundles = await fetchSeasonBundles(anchorSeasonId);
  const current = getStadiumCatalogFromBundles(bundles);
  const next = [...current.filter((row) => row.id !== entry.id), entry];
  return upsertSeasonBundle(anchorSeasonId, "global", "stadium_photos", { entries: next } satisfies StadiumCatalogBundle);
}

export async function saveClubStadiumForSeason(
  seasonId: string,
  gender: PrimerEquipoGender,
  bundles: SeasonBundlesMap,
  stadium: StadiumInfo,
  clubName?: string,
): Promise<{ ok: boolean; error?: string }> {
  const bundle = getSquadBundle(bundles, gender);
  const players = bundle?.players ?? [];
  const clubInfo = {
    ...(bundle?.clubInfo ?? {}),
    estadio: stadium.nombre,
    estadioInfo: stadium,
    ...(clubName ? { nombre: clubName } : {}),
  };

  const catalogEntry = catalogEntryFromStadium(stadium, { teamLabel: clubName ?? gender });
  const catalogResult = await upsertStadiumCatalogEntry(catalogEntry);
  if (!catalogResult.ok) return catalogResult;

  return upsertSeasonBundle(seasonId, gender, "squad", { players, clubInfo });
}
