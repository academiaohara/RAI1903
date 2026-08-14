"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { CrestPickerPopover } from "@/components/competicion/CrestPickerPopover";
import { TeamColorPairInput } from "@/components/editor/TeamColorPairInput";
import {
  getGroupTeamSlots,
  normalizeGroupTeamSlots,
  slotDisplayName,
  slugFromTeamName,
  uniqueTeamId,
  withGroupTeamsInConfig,
  type GroupTeamSlot,
} from "@/lib/cms/group-teams";
import { resolveCompetitionConfig } from "@/lib/cms/competition-config-bundle";
import {
  collectFixtureTeamIdChanges,
  remapSeasonFixturesForTeamIdChanges,
} from "@/lib/cms/remap-fixture-team-ids";
import { upsertSeasonBundle, bundleMapKey } from "@/lib/cms/season-bundles";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import type { TeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import type { CmsTeamRecord, SeasonTeamsBundle } from "@/lib/cms/teams-bundle";
import { getTeamCrestById, isTeamCrestUrl } from "@/lib/team-crests";
import { resolveTeamColorsFromSources, teamStripeBackgroundStyle } from "@/lib/team-stripes";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";

type GuiaLigaGroupEditorProps = {
  gender: PrimerEquipoGender;
  grupo: RfefGrupoId;
  onClose: () => void;
};

function resolveSlotShortName(
  slot: GroupTeamSlot,
  bundleTeams: CmsTeamRecord[],
): string {
  const cms =
    bundleTeams.find((team) => team.id === slot.id) ??
    (slot.name.trim()
      ? bundleTeams.find((team) => team.id === slugFromTeamName(slot.name))
      : undefined);
  if (cms?.shortName?.trim()) return cms.shortName.trim();
  const name = slot.name.trim();
  return name ? name.slice(0, 12) : "";
}

function syncSlotIds(slots: GroupTeamSlot[], grupo: RfefGrupoId): GroupTeamSlot[] {
  const usedIds = new Set<string>();
  return slots.map((slot, index) => {
    const fallback = `grupo-${grupo}-slot-${index + 1}`;
    const slug = slot.name.trim() ? slugFromTeamName(slot.name) : "";
    const preferred = slug || slot.id.trim() || fallback;
    const id = uniqueTeamId(preferred, usedIds, fallback);
    usedIds.add(id);
    return { ...slot, id };
  });
}

export function GuiaLigaGroupEditor({ gender, grupo, onClose }: GuiaLigaGroupEditorProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const config = useMemo(() => resolveCompetitionConfig(bundles, gender), [bundles, gender]);
  const storedSlots = useMemo(() => getGroupTeamSlots(bundles, gender, grupo), [bundles, gender, grupo]);
  const crestsFromBundle = useMemo(() => getTeamCrestsBundle(bundles).crests, [bundles]);
  const bundleTeams = useMemo(
    () => (bundles[bundleMapKey(gender, "teams")] as SeasonTeamsBundle | undefined)?.teams ?? [],
    [bundles, gender],
  );

  const [slots, setSlots] = useState<GroupTeamSlot[]>(storedSlots);
  const [shortNames, setShortNames] = useState<string[]>(() =>
    storedSlots.map((slot) => resolveSlotShortName(slot, bundleTeams)),
  );
  const [crests, setCrests] = useState<Record<string, string>>({});
  const [colorOverrides, setColorOverrides] = useState<Record<string, [string, string]>>({});
  const [pickingForIndex, setPickingForIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setSlots(storedSlots);
      setShortNames(storedSlots.map((slot) => resolveSlotShortName(slot, bundleTeams)));
      setCrests({});
      setColorOverrides({});
    });
  }, [storedSlots, bundleTeams]);

  const effectiveColors = useMemo(() => {
    const map: Record<string, [string, string]> = {};
    for (const slot of slots) {
      if (colorOverrides[slot.id]) {
        map[slot.id] = colorOverrides[slot.id]!;
        continue;
      }
      const cms =
        bundleTeams.find((team) => team.id === slot.id) ??
        (slot.name.trim()
          ? bundleTeams.find((team) => team.id === slugFromTeamName(slot.name))
          : undefined);
      map[slot.id] = resolveTeamColorsFromSources(slot.id, cms?.colors);
    }
    return map;
  }, [slots, colorOverrides, bundleTeams]);

  const effectiveCrests = useMemo(
    () => ({ ...crestsFromBundle, ...crests }),
    [crests, crestsFromBundle],
  );

  const updateSlotName = (index: number, name: string) => {
    setSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, name } : slot)),
    );
    setShortNames((current) => {
      const next = [...current];
      while (next.length <= index) next.push("");
      const previousName = slots[index]?.name ?? "";
      const previousAuto = previousName.trim().slice(0, 12);
      const currentShort = next[index] ?? "";
      if (!currentShort || currentShort === previousAuto) {
        next[index] = name.trim().slice(0, 12);
      }
      return next;
    });
  };

  const updateShortName = (index: number, shortName: string) => {
    setShortNames((current) => {
      const next = [...current];
      while (next.length <= index) next.push("");
      next[index] = shortName;
      return next;
    });
  };

  const importFromOtherGroup = () => {
    const otherGrupo = grupo === "1" ? "2" : "1";
    const otherSlots = getGroupTeamSlots(bundles, gender, otherGrupo);
    const otherNames = otherSlots.map((slot) => slot.name.trim()).filter(Boolean);
    if (!otherNames.length) {
      setMessage(`No hay equipos con nombre en el Grupo ${otherGrupo}.`);
      return;
    }

    const nextSlots = slots.map((slot) => ({ ...slot }));
    const nextShortNames = [...shortNames];
    while (nextShortNames.length < nextSlots.length) nextShortNames.push("");

    let sourceIndex = 0;
    for (let slotIndex = 0; slotIndex < nextSlots.length && sourceIndex < otherSlots.length; slotIndex += 1) {
      const sourceSlot = otherSlots[sourceIndex]!;
      if (!nextSlots[slotIndex]!.name.trim() && sourceSlot.name.trim()) {
        nextSlots[slotIndex] = { ...nextSlots[slotIndex]!, name: sourceSlot.name };
        nextShortNames[slotIndex] =
          resolveSlotShortName(sourceSlot, bundleTeams) || sourceSlot.name.trim().slice(0, 12);
        sourceIndex += 1;
      }
    }

    setSlots(syncSlotIds(nextSlots, grupo));
    setShortNames(nextShortNames);
    setMessage(null);
  };

  const clearSlot = (index: number) => {
    setSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, name: "" } : slot)),
    );
    setShortNames((current) => {
      const next = [...current];
      next[index] = "";
      return next;
    });
  };

  const assignCrest = (index: number, path: string) => {
    const slot = slots[index];
    if (!slot) return;
    setCrests((current) => ({ ...current, [slot.id]: path }));
    setPickingForIndex(null);
  };

  const updateColors = (slotId: string, colors: [string, string]) => {
    setColorOverrides((current) => ({ ...current, [slotId]: colors }));
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);

    const normalized = normalizeGroupTeamSlots(syncSlotIds(slots, grupo), config.teamsPerGroup, grupo);
    const colorsByIndex = slots.map((slot) => effectiveColors[slot.id]!);
    const idChanges = collectFixtureTeamIdChanges(storedSlots, normalized);
    const nextConfig = withGroupTeamsInConfig(config, grupo, normalized);

    const existingTeams =
      (bundles[bundleMapKey(gender, "teams")] as SeasonTeamsBundle | undefined)?.teams ?? [];
    const byId = new Map(existingTeams.map((team) => [team.id, team]));
    for (const [index, slot] of normalized.entries()) {
      const name = slotDisplayName(slot, index);
      const previous = byId.get(slot.id);
      const shortName = (shortNames[index] ?? "").trim() || (slot.name.trim() ? name.slice(0, 12) : "");
      const record: CmsTeamRecord = {
        id: slot.id,
        name: slot.name.trim() ? name : "",
        shortName,
        coach: previous?.coach ?? "",
        stadium: previous?.stadium ?? "",
        crestInitials: previous?.crestInitials ?? name.slice(0, 3).toUpperCase(),
        colors: [...colorsByIndex[index]!],
        removed: !slot.name.trim(),
      };
      byId.set(slot.id, record);
    }

    const configResult = await upsertSeasonBundle(viewedSeasonId, gender, "competition_config", nextConfig);
    if (!configResult.ok) {
      setBusy(false);
      setMessage(configResult.error ?? "Error al guardar equipos del grupo");
      return;
    }

    const teamsResult = await upsertSeasonBundle(viewedSeasonId, gender, "teams", {
      teams: [...byId.values()],
    } satisfies SeasonTeamsBundle);
    if (!teamsResult.ok) {
      setBusy(false);
      setMessage(teamsResult.error ?? "Error al guardar metadatos de equipos");
      return;
    }

    if (idChanges.length > 0) {
      const remapped = remapSeasonFixturesForTeamIdChanges(bundles, gender, idChanges);
      if (remapped) {
        const fixturesResult = await upsertSeasonBundle(viewedSeasonId, gender, "fixtures", remapped);
        if (!fixturesResult.ok) {
          setBusy(false);
          setMessage(fixturesResult.error ?? "Error al actualizar IDs en el calendario de partidos");
          return;
        }
      }
    }

    if (Object.keys(crests).length > 0 || idChanges.length > 0) {
      const remappedCrests = { ...crestsFromBundle, ...crests };
      for (const change of idChanges) {
        if (remappedCrests[change.from] && !remappedCrests[change.to]) {
          remappedCrests[change.to] = remappedCrests[change.from];
        }
      }
      const payload: TeamCrestsBundle = {
        crests: remappedCrests,
      };
      const crestResult = await upsertSeasonBundle(viewedSeasonId, "global", "team_crests", payload);
      if (!crestResult.ok) {
        setBusy(false);
        setMessage(crestResult.error ?? "Error al guardar escudos");
        return;
      }
    }

    setBusy(false);
    setMessage(`Grupo guardado (${viewedSeason.label})`);
    await refreshBundles();
    onClose();
  };

  const pickingSlot = pickingForIndex != null ? slots[pickingForIndex] : null;

  return (
    <>
      <div className="mb-4 rounded-2xl border border-[#214C9B]/20 bg-blue-50/40 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#214C9B]">Editar equipos del grupo</p>
            <p className="text-[10px] font-semibold text-slate-500">
              {viewedSeason.label} · {config.teamsPerGroup} plazas · deja vacío para «Equipo N». Nueva temporada:
              actualiza los 20 clubes aquí; la plantilla de cada rival se edita en su ficha (modo edición).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={importFromOtherGroup}
              className="min-h-9 rounded-full border border-[#214C9B]/30 px-3 py-1.5 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-white active:bg-blue-50"
            >
              Rellenar desde Grupo {grupo === "1" ? "2" : "1"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-9 rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-extrabold uppercase text-slate-600 hover:bg-white active:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {slots.map((slot, index) => {
            const label = slotDisplayName(slot, index);
            const crestPath = effectiveCrests[slot.id] ?? getTeamCrestById(slot.id);
            const showImage = isTeamCrestUrl(crestPath);
            const empty = !slot.name.trim();
            const slotColors = effectiveColors[slot.id]!;

            return (
              <div
                key={`slot-${index}`}
                className={`flex flex-col gap-1.5 rounded-xl border p-2 sm:p-1.5 ${
                  empty ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className="flex aspect-square items-center justify-center overflow-hidden rounded-lg p-0.5 ring-1 ring-black/10"
                  style={teamStripeBackgroundStyle(slotColors)}
                >
                  {showImage ? (
                    <Image
                      src={crestPath}
                      alt=""
                      width={64}
                      height={64}
                      className="relative z-10 h-[65%] w-[65%] object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
                      unoptimized
                    />
                  ) : (
                    <span className="relative z-10 text-center text-[10px] font-extrabold uppercase text-white drop-shadow">
                      {empty ? `#${index + 1}` : label.slice(0, 3)}
                    </span>
                  )}
                </div>
                <input
                  value={slot.name}
                  onChange={(event) => updateSlotName(index, event.target.value)}
                  placeholder={`Equipo ${index + 1}`}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold sm:px-1 sm:py-0.5 sm:text-[10px]"
                />
                {!empty ? (
                  <input
                    value={shortNames[index] ?? ""}
                    onChange={(event) => updateShortName(index, event.target.value)}
                    placeholder="Nombre corto"
                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600 sm:px-1 sm:py-0.5 sm:text-[10px]"
                  />
                ) : null}
                {!empty ? (
                  <TeamColorPairInput
                    fieldId={`guia-liga-${slot.id}`}
                    compact
                    colors={slotColors}
                    onChange={(colors) => updateColors(slot.id, colors)}
                  />
                ) : null}
                <p className="truncate text-[9px] text-slate-400" title={slot.id}>
                  {slot.id}
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPickingForIndex(index)}
                    className="min-h-9 flex-1 rounded-md border border-[#214C9B]/20 px-2 py-1.5 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 active:bg-blue-100 sm:min-h-0 sm:px-1 sm:py-0.5 sm:text-[9px]"
                  >
                    Escudo
                  </button>
                  {!empty && (
                    <button
                      type="button"
                      onClick={() => clearSlot(index)}
                      className="flex min-h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 px-2 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50 active:bg-slate-100 sm:min-h-0 sm:min-w-0 sm:px-1 sm:py-0.5 sm:text-[9px]"
                      aria-label={`Vaciar ${label}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="min-h-11 rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] active:bg-[#0f2d5c] disabled:opacity-60"
          >
            {busy ? "Guardando…" : "Guardar equipos del grupo"}
          </button>
          {message && <p className="text-xs font-semibold text-slate-600">{message}</p>}
        </div>
      </div>

      {pickingSlot && pickingForIndex != null ? (
        <CrestPickerPopover
          teamLabel={slotDisplayName(pickingSlot, pickingForIndex)}
          currentPath={effectiveCrests[pickingSlot.id]}
          onSelect={(path) => assignCrest(pickingForIndex, path)}
          onClose={() => setPickingForIndex(null)}
        />
      ) : null}
    </>
  );
}
