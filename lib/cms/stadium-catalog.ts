import { listStadiumAssets } from "@/lib/stadium-assets";
import { fetchEditorSeasons } from "@/lib/cms/seasons-editor";
import { getRivalSquadsBundle, withRivalSquadInBundle } from "@/lib/cms/rival-squads-bundle";
import {
  bundleMapKey,
  fetchSeasonBundles,
  getSquadBundle,
  upsertSeasonBundle,
  type SeasonBundlesMap,
} from "@/lib/cms/season-bundles";
import type { RivalSquadImport } from "@/types/rival-squad-import";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { StadiumInfo } from "@/types/squad";

export type StadiumCatalogEntry = StadiumInfo & {
  id: string;
  /** Temporada de origen (si se conoce). */
  seasonLabel?: string;
  /** Equipo asociado en esa temporada. */
  teamLabel?: string;
  /** Solo entradas del catálogo CMS (`stadium_photos`) se pueden borrar desde el editor. */
  deletable?: boolean;
};

export type StadiumCatalogBundle = {
  entries: StadiumCatalogEntry[];
};

export function stadiumEntryKey(info: Pick<StadiumInfo, "nombre" | "imagen">): string {
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
    deletable: existing.deletable || entry.deletable,
  });
}

async function writeStadiumCatalogEntries(
  entries: StadiumCatalogEntry[],
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const seasons = await fetchEditorSeasons();
  const anchorSeasonId = seasons.find((row) => row.isDefault)?.id ?? seasons[0]?.id;
  if (!anchorSeasonId) {
    return { ok: false, error: "No hay temporadas para guardar el catálogo" };
  }

  return upsertSeasonBundle(anchorSeasonId, "global", "stadium_photos", {
    entries,
  } satisfies StadiumCatalogBundle);
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
      mergeEntries(merged, { ...entry, deletable: true });
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
  const seasons = await fetchEditorSeasons();
  const anchorSeasonId = seasons.find((row) => row.isDefault)?.id ?? seasons[0]?.id;
  if (!anchorSeasonId) {
    return { ok: false, error: "No hay temporadas para guardar el catálogo" };
  }

  const bundles = await fetchSeasonBundles(anchorSeasonId);
  const current = getStadiumCatalogFromBundles(bundles);
  const next = [...current.filter((row) => row.id !== entry.id), { ...entry, deletable: true }];
  return writeStadiumCatalogEntries(next);
}

export async function updateStadiumCatalogEntry(
  previousId: string,
  stadium: StadiumInfo,
  meta?: { seasonLabel?: string; teamLabel?: string },
): Promise<{ ok: boolean; error?: string }> {
  const entry: StadiumCatalogEntry = { ...catalogEntryFromStadium(stadium, meta), deletable: true };
  const seasons = await fetchEditorSeasons();
  const anchorSeasonId = seasons.find((row) => row.isDefault)?.id ?? seasons[0]?.id;
  if (!anchorSeasonId) {
    return { ok: false, error: "No hay temporadas para guardar el catálogo" };
  }

  const bundles = await fetchSeasonBundles(anchorSeasonId);
  const current = getStadiumCatalogFromBundles(bundles);
  const next = [...current.filter((row) => row.id !== previousId && row.id !== entry.id), entry];
  return writeStadiumCatalogEntries(next);
}

export async function deleteStadiumCatalogEntry(entryId: string): Promise<{ ok: boolean; error?: string }> {
  const seasons = await fetchEditorSeasons();
  const anchorSeasonId = seasons.find((row) => row.isDefault)?.id ?? seasons[0]?.id;
  if (!anchorSeasonId) {
    return { ok: false, error: "No hay temporadas para guardar el catálogo" };
  }

  const bundles = await fetchSeasonBundles(anchorSeasonId);
  const current = getStadiumCatalogFromBundles(bundles);
  if (!current.some((row) => row.id === entryId)) {
    return { ok: false, error: "Solo puedes borrar estadios guardados en el catálogo (no los del repositorio)" };
  }

  const next = current.filter((row) => row.id !== entryId);
  return writeStadiumCatalogEntries(next);
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

export async function saveRivalStadiumForSeason(
  seasonId: string,
  gender: PrimerEquipoGender,
  bundles: SeasonBundlesMap,
  teamId: string,
  stadium: StadiumInfo,
  fallbackImport?: RivalSquadImport,
): Promise<{ ok: boolean; error?: string }> {
  const catalogEntry = catalogEntryFromStadium(stadium, { teamLabel: teamId });
  const catalogResult = await upsertStadiumCatalogEntry(catalogEntry);
  if (!catalogResult.ok) return catalogResult;

  const rivalBundle = getRivalSquadsBundle(bundles, gender);
  const current = rivalBundle.squads[teamId] ?? fallbackImport;
  if (!current) {
    return { ok: false, error: "No hay plantilla rival para asociar el estadio" };
  }

  const next: RivalSquadImport = {
    ...current,
    estadio: stadium.nombre,
    capacidad: stadium.capacidad,
    estadioInfo: stadium,
  };

  return upsertSeasonBundle(
    seasonId,
    gender,
    "rival_squads",
    withRivalSquadInBundle(rivalBundle, teamId, next),
  );
}
