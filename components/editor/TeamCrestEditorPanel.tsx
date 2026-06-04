"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import type { AssetCatalogEntry } from "@/lib/asset-catalog";
import { resolveCompetitionConfig } from "@/lib/cms/competition-config-bundle";
import {
  getGroupTeamSlots,
  slotDisplayName,
  type GroupTeamSlot,
} from "@/lib/cms/group-teams";
import { saveFemeninoGroupTeamsAndCrests } from "@/lib/cms/save-femenino-group-teams";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import { collectTeamsFromBundles } from "@/lib/season/teams-from-fixtures";
import { getTeamCrestById, isTeamCrestUrl } from "@/lib/team-crests";

type TeamCrestEditorPanelProps = {
  onClose: () => void;
};

export function TeamCrestEditorPanel({ onClose }: TeamCrestEditorPanelProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [catalog, setCatalog] = useState<AssetCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [crestDraft, setCrestDraft] = useState<Record<string, string> | null>(null);
  const [filter, setFilter] = useState("");
  const [pickingForTeamId, setPickingForTeamId] = useState<string | null>(null);
  const [manualPath, setManualPath] = useState("");

  const femConfig = useMemo(() => resolveCompetitionConfig(bundles, "femenino"), [bundles]);
  const storedFemSlots = useMemo(() => getGroupTeamSlots(bundles, "femenino", "1"), [bundles]);
  const [femSlots, setFemSlots] = useState<GroupTeamSlot[]>(storedFemSlots);

  const crestsFromBundle = useMemo(() => getTeamCrestsBundle(bundles).crests, [bundles]);
  const crests = crestDraft ?? crestsFromBundle;

  const femSlotIds = useMemo(() => new Set(femSlots.map((slot) => slot.id)), [femSlots]);

  const otherTeams = useMemo(
    () => collectTeamsFromBundles(bundles).filter((team) => !femSlotIds.has(team.id)),
    [bundles, femSlotIds],
  );

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/cms/assets");
    if (!response.ok) {
      setMessage("No se pudo cargar el catálogo de imágenes");
      setLoading(false);
      return;
    }
    const data = (await response.json()) as { crests: AssetCatalogEntry[] };
    setCatalog(data.crests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCatalog();
    });
  }, [loadCatalog]);

  useEffect(() => {
    queueMicrotask(() => {
      setCrestDraft(null);
      setFemSlots(storedFemSlots);
    });
  }, [bundles, viewedSeasonId, storedFemSlots]);

  const filteredCatalog = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((entry) => entry.slug.includes(q) || entry.path.toLowerCase().includes(q));
  }, [catalog, filter]);

  const updateFemSlotName = (index: number, name: string) => {
    setFemSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, name } : slot)),
    );
  };

  const assignCrest = (teamId: string, path: string) => {
    const trimmed = path.trim();
    if (!trimmed) return;
    setCrestDraft((current) => ({ ...(current ?? crestsFromBundle), [teamId]: trimmed }));
    setPickingForTeamId(null);
    setManualPath("");
  };

  const clearCrest = (teamId: string) => {
    setCrestDraft((current) => {
      const next = { ...(current ?? crestsFromBundle) };
      delete next[teamId];
      return next;
    });
  };

  const applyManualPath = () => {
    if (!pickingForTeamId || !manualPath.trim()) return;
    assignCrest(pickingForTeamId, manualPath.trim());
  };

  const pickingLabel = useMemo(() => {
    if (!pickingForTeamId) return "";
    const femIndex = femSlots.findIndex((slot) => slot.id === pickingForTeamId);
    if (femIndex >= 0) return slotDisplayName(femSlots[femIndex]!, femIndex);
    return otherTeams.find((team) => team.id === pickingForTeamId)?.name ?? pickingForTeamId;
  }, [femSlots, otherTeams, pickingForTeamId]);

  const save = async () => {
    setBusy(true);
    setMessage(null);

    const result = await saveFemeninoGroupTeamsAndCrests(viewedSeasonId, bundles, femSlots, crests);
    if (!result.ok) {
      setBusy(false);
      setMessage(result.error ?? "Error al guardar liga femenina y escudos");
      return;
    }

    setBusy(false);
    setMessage(`Liga femenina y escudos guardados (${viewedSeason.label})`);
    setCrestDraft(null);
    await refreshBundles();
  };

  const renderCrestPicker = () =>
    pickingForTeamId ? (
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-[#214C9B]">Escudo: {pickingLabel}</p>
          <button
            type="button"
            onClick={() => {
              setPickingForTeamId(null);
              setManualPath("");
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Cancelar
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={manualPath}
            onChange={(event) => setManualPath(event.target.value)}
            placeholder="/escudos/lealtad.png"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={applyManualPath}
            disabled={!manualPath.trim()}
            className="shrink-0 rounded-lg bg-[#214C9B] px-2 py-1.5 text-[10px] font-extrabold uppercase text-white disabled:opacity-50"
          >
            Usar ruta
          </button>
        </div>
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Buscar en imágenes del repo…"
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
        />
        <div className="grid max-h-40 grid-cols-4 gap-2 overflow-y-auto">
          {filteredCatalog.map((entry) => (
            <button
              key={entry.path}
              type="button"
              onClick={() => assignCrest(pickingForTeamId, entry.path)}
              className="flex flex-col items-center gap-1 rounded-lg border border-slate-100 p-1 hover:border-[#214C9B]/40 hover:bg-blue-50"
              title={entry.path}
            >
              <Image
                src={entry.path}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                unoptimized
              />
              <span className="max-w-full truncate text-[9px] font-semibold text-slate-500">{entry.slug}</span>
            </button>
          ))}
        </div>
      </div>
    ) : null;

  const renderCrestActions = (teamId: string, assigned: string | undefined) => (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        onClick={() => {
          setFilter("");
          setManualPath(assigned ?? `/escudos/${teamId}.png`);
          setPickingForTeamId(teamId);
        }}
        className="rounded-lg border border-[#214C9B]/20 px-2 py-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
      >
        Elegir
      </button>
      {assigned && (
        <button
          type="button"
          onClick={() => clearCrest(teamId)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-50"
        >
          Quitar
        </button>
      )}
    </div>
  );

  const renderCrestThumb = (teamId: string, preview: string) => (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
      {isTeamCrestUrl(preview) ? (
        <Image src={preview} alt="" width={32} height={32} className="h-8 w-8 object-contain" unoptimized />
      ) : (
        <span className="text-[10px] font-bold text-slate-400">{preview}</span>
      )}
    </div>
  );

  return (
    <div className="flex max-h-[min(85vh,40rem)] w-[min(100vw-2rem,30rem)] flex-col rounded-2xl border border-[#214C9B]/20 bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Escudos</h3>
          <p className="text-[10px] font-semibold text-slate-500">Temporada {viewedSeason.label}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-3 space-y-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          <p>
            <strong>Liga femenina:</strong> edita los {femConfig.teamsPerGroup} nombres del grupo y su escudo. La
            clasificación y el calendario usan esta lista (no hace falta abrir Competición).
          </p>
          <p>
            <strong>Imágenes:</strong> sube PNG a <code className="rounded bg-white px-1">public/escudos/</code> y
            asigna la ruta <code className="rounded bg-white px-1">/escudos/archivo.png</code>.
          </p>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 size={14} className="animate-spin" /> Cargando imágenes…
          </p>
        ) : (
          <>
            {renderCrestPicker()}

            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-[#981915]">
              Liga femenina · {femConfig.teamsPerGroup} equipos
            </p>
            <ul className="mb-4 space-y-2">
              {femSlots.map((slot, index) => {
                const label = slotDisplayName(slot, index);
                const assigned = crests[slot.id];
                const preview = assigned ?? getTeamCrestById(slot.id);

                return (
                  <li
                    key={`fem-${index}-${slot.id}`}
                    className="flex items-start gap-2 rounded-xl border border-[#981915]/15 bg-rose-50/30 px-2 py-2"
                  >
                    {renderCrestThumb(slot.id, preview)}
                    <div className="min-w-0 flex-1 space-y-1">
                      <input
                        value={slot.name}
                        onChange={(event) => updateFemSlotName(index, event.target.value)}
                        placeholder={label}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800"
                        aria-label={`Nombre ${label}`}
                      />
                      <p className="truncate text-[10px] text-slate-400">{slot.id}</p>
                      {assigned && <p className="truncate text-[9px] text-emerald-700">{assigned}</p>}
                    </div>
                    {renderCrestActions(slot.id, assigned)}
                  </li>
                );
              })}
            </ul>

            {otherTeams.length > 0 ? (
              <>
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                  Otros equipos (masculino, copa…)
                </p>
                <ul className="space-y-2">
                  {otherTeams.map((team) => {
                    const assigned = crests[team.id];
                    const preview = assigned ?? getTeamCrestById(team.id);

                    return (
                      <li
                        key={team.id}
                        className="flex items-center gap-2 rounded-xl border border-slate-100 px-2 py-2"
                      >
                        {renderCrestThumb(team.id, preview)}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800">{team.name}</p>
                          <p className="truncate text-[10px] text-slate-400">{team.id}</p>
                          {assigned && <p className="truncate text-[9px] text-emerald-700">{assigned}</p>}
                        </div>
                        {renderCrestActions(team.id, assigned)}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}

            <p className="mt-3 text-[10px] font-semibold text-slate-400">
              {catalog.length} imágenes en el repo · {femSlots.length} plazas femeninas
              {otherTeams.length > 0 ? ` · ${otherTeams.length} más` : ""}
            </p>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="w-full rounded-xl bg-[#214C9B] py-2 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-50"
        >
          {busy ? "Guardando…" : "Guardar liga femenina y escudos"}
        </button>
        {message && <p className="mt-2 text-center text-xs font-semibold text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
