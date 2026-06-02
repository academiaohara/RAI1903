"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { CrestPickerPopover } from "@/components/competicion/CrestPickerPopover";
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
import { upsertSeasonBundle, bundleMapKey } from "@/lib/cms/season-bundles";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import type { TeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import type { CmsTeamRecord, SeasonTeamsBundle } from "@/lib/cms/teams-bundle";
import { getTeamCrestById, isTeamCrestUrl } from "@/lib/team-crests";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";

type GuiaLigaGroupEditorProps = {
  gender: PrimerEquipoGender;
  grupo: RfefGrupoId;
  onClose: () => void;
};

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

  const [slots, setSlots] = useState<GroupTeamSlot[]>(storedSlots);
  const [crests, setCrests] = useState<Record<string, string>>({});
  const [pickingForIndex, setPickingForIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setSlots(storedSlots);
      setCrests({});
    });
  }, [storedSlots]);

  const effectiveCrests = useMemo(
    () => ({ ...crestsFromBundle, ...crests }),
    [crests, crestsFromBundle],
  );

  const updateSlotName = (index: number, name: string) => {
    setSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, name } : slot)),
    );
  };

  const importFromOtherGroup = () => {
    const otherGrupo = grupo === "1" ? "2" : "1";
    const otherNames = getGroupTeamSlots(bundles, gender, otherGrupo)
      .map((slot) => slot.name.trim())
      .filter(Boolean);
    if (!otherNames.length) {
      setMessage(`No hay equipos con nombre en el Grupo ${otherGrupo}.`);
      return;
    }
    setSlots((current) => {
      const next = current.map((slot) => ({ ...slot }));
      let sourceIndex = 0;
      for (let slotIndex = 0; slotIndex < next.length && sourceIndex < otherNames.length; slotIndex += 1) {
        if (!next[slotIndex]!.name.trim()) {
          next[slotIndex] = { ...next[slotIndex]!, name: otherNames[sourceIndex]! };
          sourceIndex += 1;
        }
      }
      return syncSlotIds(next, grupo);
    });
    setMessage(null);
  };

  const clearSlot = (index: number) => {
    setSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, name: "" } : slot)),
    );
  };

  const assignCrest = (index: number, path: string) => {
    const slot = slots[index];
    if (!slot) return;
    setCrests((current) => ({ ...current, [slot.id]: path }));
    setPickingForIndex(null);
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);

    const normalized = normalizeGroupTeamSlots(syncSlotIds(slots, grupo), config.teamsPerGroup, grupo);
    const nextConfig = withGroupTeamsInConfig(config, grupo, normalized);

    const existingTeams =
      (bundles[bundleMapKey(gender, "teams")] as SeasonTeamsBundle | undefined)?.teams ?? [];
    const byId = new Map(existingTeams.map((team) => [team.id, team]));
    for (const [index, slot] of normalized.entries()) {
      const name = slotDisplayName(slot, index);
      const previous = byId.get(slot.id);
      const record: CmsTeamRecord = {
        id: slot.id,
        name: slot.name.trim() ? name : "",
        shortName: name.slice(0, 12),
        coach: previous?.coach ?? "",
        stadium: previous?.stadium ?? "",
        crestInitials: previous?.crestInitials ?? name.slice(0, 3).toUpperCase(),
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

    if (Object.keys(crests).length > 0) {
      const payload: TeamCrestsBundle = {
        crests: { ...crestsFromBundle, ...crests },
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
              {viewedSeason.label} · {config.teamsPerGroup} plazas · deja vacío para «Equipo N»
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={importFromOtherGroup}
              className="rounded-full border border-[#214C9B]/30 px-3 py-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-white"
            >
              Rellenar desde Grupo {grupo === "1" ? "2" : "1"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-extrabold uppercase text-slate-600 hover:bg-white"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {slots.map((slot, index) => {
            const label = slotDisplayName(slot, index);
            const crestPath = effectiveCrests[slot.id] ?? getTeamCrestById(slot.id);
            const showImage = isTeamCrestUrl(crestPath);
            const empty = !slot.name.trim();

            return (
              <div
                key={`slot-${index}`}
                className={`flex flex-col gap-1 rounded-xl border p-1.5 ${
                  empty ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex aspect-square items-center justify-center rounded-lg bg-white p-1">
                  {showImage ? (
                    <Image
                      src={crestPath}
                      alt=""
                      width={48}
                      height={48}
                      className="h-full w-full max-h-12 max-w-12 object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-center text-[10px] font-extrabold uppercase text-slate-400">
                      {empty ? `#${index + 1}` : label.slice(0, 3)}
                    </span>
                  )}
                </div>
                <input
                  value={slot.name}
                  onChange={(event) => updateSlotName(index, event.target.value)}
                  placeholder={`Equipo ${index + 1}`}
                  className="w-full rounded-md border border-slate-200 px-1 py-0.5 text-[10px] font-semibold"
                />
                <p className="truncate text-[9px] text-slate-400" title={slot.id}>
                  {slot.id}
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPickingForIndex(index)}
                    className="flex-1 rounded-md border border-[#214C9B]/20 px-1 py-0.5 text-[9px] font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
                  >
                    Escudo
                  </button>
                  {!empty && (
                    <button
                      type="button"
                      onClick={() => clearSlot(index)}
                      className="rounded-md border border-slate-200 px-1 py-0.5 text-[9px] font-bold text-slate-500 hover:bg-slate-50"
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
            className="rounded-xl bg-[#214C9B] px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
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
