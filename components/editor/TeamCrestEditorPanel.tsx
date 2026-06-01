"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import type { AssetCatalogEntry } from "@/lib/asset-catalog";
import { upsertSeasonBundle } from "@/lib/cms/season-bundles";
import type { TeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import { collectTeamsFromBundles } from "@/lib/season/teams-from-fixtures";
import { getTeamCrestById } from "@/lib/team-crests";

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

  const teams = useMemo(() => collectTeamsFromBundles(bundles), [bundles]);
  const crestsFromBundle = useMemo(() => getTeamCrestsBundle(bundles).crests, [bundles]);
  const crests = crestDraft ?? crestsFromBundle;

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
    queueMicrotask(() => setCrestDraft(null));
  }, [bundles, viewedSeasonId]);

  const filteredCatalog = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((entry) => entry.slug.includes(q) || entry.path.toLowerCase().includes(q));
  }, [catalog, filter]);

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const payload: TeamCrestsBundle = { crests };
    const result = await upsertSeasonBundle(viewedSeasonId, "global", "team_crests", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar");
      return;
    }
    setMessage("Escudos guardados en Supabase para " + viewedSeason.label);
    setCrestDraft(null);
    await refreshBundles();
  };

  const assignCrest = (teamId: string, path: string) => {
    setCrestDraft((current) => ({ ...(current ?? crestsFromBundle), [teamId]: path }));
    setPickingForTeamId(null);
  };

  const clearCrest = (teamId: string) => {
    setCrestDraft((current) => {
      const next = { ...(current ?? crestsFromBundle) };
      delete next[teamId];
      return next;
    });
  };

  return (
    <div className="flex max-h-[min(85vh,32rem)] w-[min(100vw-2rem,28rem)] flex-col rounded-2xl border border-[#214C9B]/20 bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Escudos</h3>
          <p className="text-[10px] font-semibold text-slate-500">
            Imágenes en GitHub · asociación en Supabase ({viewedSeason.label})
          </p>
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
        <p className="mb-3 text-xs leading-relaxed text-slate-600">
          Añade PNG a la carpeta <strong>Escudos</strong> del repo, ejecuta{" "}
          <code className="rounded bg-slate-100 px-1">npm run import:assets</code> y despliega. Luego elige qué
          escudo corresponde a cada equipo aquí.
        </p>

        {loading ? (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 size={14} className="animate-spin" /> Cargando imágenes…
          </p>
        ) : (
          <>
            {pickingForTeamId ? (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[#214C9B]">
                    Elegir escudo para {teams.find((t) => t.id === pickingForTeamId)?.name ?? pickingForTeamId}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPickingForTeamId(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                </div>
                <input
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Buscar slug…"
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                />
                <div className="grid max-h-40 grid-cols-4 gap-2 overflow-y-auto">
                  {filteredCatalog.map((entry) => (
                    <button
                      key={entry.slug}
                      type="button"
                      onClick={() => assignCrest(pickingForTeamId, entry.path)}
                      className="flex flex-col items-center gap-1 rounded-lg border border-slate-100 p-1 hover:border-[#214C9B]/40 hover:bg-blue-50"
                      title={entry.slug}
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
            ) : null}

            <ul className="space-y-2">
              {teams.map((team) => {
                const assigned = crests[team.id];
                const preview = assigned ?? getTeamCrestById(team.id);
                const showImage = preview.startsWith("/");

                return (
                  <li
                    key={team.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 px-2 py-2"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                      {showImage ? (
                        <Image
                          src={preview}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">{preview}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{team.name}</p>
                      <p className="truncate text-[10px] text-slate-400">{team.id}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setFilter("");
                          setPickingForTeamId(team.id);
                        }}
                        className="rounded-lg border border-[#214C9B]/20 px-2 py-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
                      >
                        Elegir
                      </button>
                      {assigned && (
                        <button
                          type="button"
                          onClick={() => clearCrest(team.id)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-50"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-3 text-[10px] font-semibold text-slate-400">
              {catalog.length} imágenes en el repo · {teams.length} equipos detectados
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
          {busy ? "Guardando…" : "Guardar asociaciones en Supabase"}
        </button>
        {message && <p className="mt-2 text-center text-xs font-semibold text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
