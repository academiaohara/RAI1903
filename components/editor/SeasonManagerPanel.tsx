"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  deleteSeason,
  duplicateSeason,
  fetchEditorSeasons,
  seedSeasonFromMock,
  setDefaultSeason,
  updateSeason,
} from "@/lib/cms/seasons-editor";
import { createSeasonWithLeagueTemplates } from "@/lib/cms/apply-league-template";
import type { CmsSeason } from "@/lib/cms/seasons";
import {
  leagueTemplatesForGender,
  type LeagueTemplateId,
} from "@/lib/competition/league-templates";

type SeasonManagerPanelProps = {
  onClose: () => void;
};

export function SeasonManagerPanel({ onClose }: SeasonManagerPanelProps) {
  const { viewedSeasonId, refreshSeasons, refreshBundles, setViewedSeasonId, activeSeasonId } =
    useSeason();
  const [rows, setRows] = useState<CmsSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newId, setNewId] = useState("2026-27");
  const [newLabel, setNewLabel] = useState("26/27");
  const [duplicateFrom, setDuplicateFrom] = useState<CompetitionSeasonId>("2025-26");
  const [masculinoTemplate, setMasculinoTemplate] = useState<LeagueTemplateId | "">("primera-rfef-2x20");
  const [femeninoTemplate, setFemeninoTemplate] = useState<LeagueTemplateId | "">("segunda-rfef-femenina-14");
  const [createMode, setCreateMode] = useState<"duplicate" | "templates">("templates");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchEditorSeasons();
    setRows(data);
    setDuplicateFrom((current) => {
      if (!data.length) return current;
      if (data.some((row) => row.id === current)) return current;
      return data.find((row) => row.isDefault)?.id ?? data[0].id;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const runAction = async (action: () => Promise<{ ok: boolean; error?: string }>, success: string) => {
    setBusy(true);
    setMessage(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error desconocido");
      return;
    }
    setMessage(success);
    await refreshSeasons();
    await refreshBundles();
    await load();
  };

  const handleDelete = (row: CmsSeason) => {
    const confirmed = window.confirm(
      `¿Borrar la temporada «${row.label}» (${row.id})?\n\nSe eliminarán plantillas, calendarios, escudos y ediciones asociadas. No se puede deshacer.`,
    );
    if (!confirmed) return;
    void runAction(() => deleteSeason(row.id), `Temporada ${row.label} eliminada`);
  };

  return (
    <div className="w-[min(100vw-2rem,26rem)] rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Temporadas</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-slate-600">
        Puedes tener varias temporadas (25/26, 26/27…). Solo una puede ser <strong>principal</strong> (por
        defecto en la web). El resto puede estar <strong>activa</strong> (visible y con mercado en la home) o{" "}
        <strong>inactiva</strong>. <strong>Ver</strong> cambia qué temporada editas ahora ({viewedSeasonId}).
      </p>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Cargando…
        </p>
      ) : (
        <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto text-xs">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-2 py-2"
            >
              <div>
                <span className="font-bold text-slate-800">{row.label}</span>
                <span className="ml-2 text-slate-400">{row.id}</span>
                {row.isDefault && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                    Principal
                  </span>
                )}
                {viewedSeasonId === row.id && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 font-bold text-[#214C9B]">
                    Editando
                  </span>
                )}
                {row.published ?
                  <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 font-bold text-sky-800">
                    Activa
                  </span>
                : <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                    Inactiva
                  </span>
                }
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setViewedSeasonId(row.id as CompetitionSeasonId);
                    setMessage(`Editando ${row.label}`);
                  }}
                  className="rounded-lg border border-[#214C9B]/20 px-2 py-1 font-bold text-[#214C9B] hover:bg-blue-50 disabled:opacity-50"
                >
                  Ver
                </button>
                {!row.isDefault && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void runAction(
                        () => setDefaultSeason(row.id),
                        `${row.label} es ahora la temporada principal`,
                      )
                    }
                    className="rounded-lg bg-[#214C9B] px-2 py-1 font-bold text-white hover:bg-[#173a78] disabled:opacity-50"
                  >
                    Principal
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void runAction(
                      () => updateSeason(row.id, { published: !row.published }),
                      row.published ? "Temporada desactivada" : "Temporada activada",
                    )
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {row.published ? "Desactivar" : "Activar"}
                </button>
                {!row.isDefault && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(row)}
                    className="inline-flex items-center gap-0.5 rounded-lg border border-[#981915]/25 px-2 py-1 font-bold text-[#981915] hover:bg-red-50 disabled:opacity-50"
                    title="Eliminar temporada"
                  >
                    <Trash2 size={12} />
                    Borrar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 border-t border-slate-100 pt-3 text-xs">
        <p className="font-bold uppercase tracking-wide text-slate-500">Nueva temporada</p>
        <p className="text-slate-500">
          ID recomendado: <code className="rounded bg-slate-100 px-1">2026-27</code> · etiqueta:{" "}
          <code className="rounded bg-slate-100 px-1">26/27</code>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">ID</span>
            <input
              value={newId}
              onChange={(event) => setNewId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
              placeholder="2026-27"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Etiqueta</span>
            <input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
              placeholder="26/27"
            />
          </label>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5">
          <button
            type="button"
            onClick={() => setCreateMode("templates")}
            className={`flex-1 rounded-md px-2 py-1.5 font-bold ${
              createMode === "templates" ? "bg-[#214C9B] text-white" : "text-slate-600"
            }`}
          >
            Con plantillas
          </button>
          <button
            type="button"
            onClick={() => setCreateMode("duplicate")}
            className={`flex-1 rounded-md px-2 py-1.5 font-bold ${
              createMode === "duplicate" ? "bg-[#214C9B] text-white" : "text-slate-600"
            }`}
          >
            Duplicar
          </button>
        </div>

        {createMode === "templates" ? (
          <>
            <label className="block space-y-1">
              <span className="font-semibold text-slate-600">Liga masculina</span>
              <select
                value={masculinoTemplate}
                onChange={(e) => setMasculinoTemplate(e.target.value as LeagueTemplateId | "")}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
              >
                <option value="">Sin configurar</option>
                {leagueTemplatesForGender("masculino").map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.description}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-semibold text-slate-600">Liga femenina</span>
              <select
                value={femeninoTemplate}
                onChange={(e) => setFemeninoTemplate(e.target.value as LeagueTemplateId | "")}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
              >
                <option value="">Sin configurar</option>
                {leagueTemplatesForGender("femenino").map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.description}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy || !newId.trim() || (!masculinoTemplate && !femeninoTemplate)}
              onClick={() =>
                void runAction(
                  () =>
                    createSeasonWithLeagueTemplates(
                      {
                        id: newId.trim(),
                        label: newLabel.trim() || newId.trim(),
                        published: false,
                      },
                      {
                        ...(masculinoTemplate ? { masculino: masculinoTemplate } : {}),
                        ...(femeninoTemplate ? { femenino: femeninoTemplate } : {}),
                      },
                    ),
                  `Temporada ${newLabel} creada con plantillas`,
                )
              }
              className="w-full rounded-xl bg-[#214C9B] py-2 font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-50"
            >
              Crear con plantillas
            </button>
          </>
        ) : (
          <>
            <label className="block space-y-1">
              <span className="font-semibold text-slate-600">Duplicar datos desde</span>
              <select
                value={duplicateFrom}
                onChange={(event) => setDuplicateFrom(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
              >
                {rows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy || !newId.trim()}
              onClick={() =>
                void runAction(
                  () =>
                    duplicateSeason(duplicateFrom, {
                      id: newId.trim(),
                      label: newLabel.trim() || newId.trim(),
                      published: false,
                    }),
                  `Temporada ${newLabel} creada`,
                )
              }
              className="w-full rounded-xl bg-[#214C9B] py-2 font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-50"
            >
              Crear y duplicar
            </button>
          </>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void runAction(
              () =>
                seedSeasonFromMock(
                  viewedSeasonId,
                  rows.find((row) => row.id === viewedSeasonId)?.label ?? viewedSeasonId,
                ),
              "Datos del código subidos a Supabase para la temporada en edición",
            )
          }
          className="w-full rounded-xl border border-[#214C9B]/25 py-2 font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 disabled:opacity-50"
        >
          Subir datos mock a «{viewedSeasonId}»
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded-lg bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600">{message}</p>
      )}
      {busy && (
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Guardando…
        </p>
      )}
      {!loading && activeSeasonId && (
        <p className="mt-2 text-[10px] text-slate-400">
          Principal actual en la web: <strong>{activeSeasonId}</strong>
        </p>
      )}
    </div>
  );
}
