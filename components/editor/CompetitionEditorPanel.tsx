"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { FixturesJsonPasteSection } from "@/components/editor/FixturesJsonPasteSection";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  defaultCompetitionConfig,
  leagueRoundCount,
  matchesPerLeagueRound,
  type CompetitionZoneRule,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import { getCompetitionConfigBundle } from "@/lib/cms/competition-config-bundle";
import { applyLeagueTemplate, buildFixturesPayloadForConfig } from "@/lib/cms/apply-league-template";
import { parsePrimerEquipoFixturesJson } from "@/lib/cms/parse-fixtures-json";
import {
  getFixturesBundle,
  upsertSeasonBundle,
  type SeasonFixturesBundle,
} from "@/lib/cms/season-bundles";
import {
  leagueTemplatesForGender,
  type LeagueTemplateId,
} from "@/lib/competition/league-templates";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

const COLOR_PRESETS = [
  { label: "Verde", value: "bg-emerald-500" },
  { label: "Azul claro", value: "bg-sky-400" },
  { label: "Rosa", value: "bg-rose-500" },
  { label: "Azul club", value: "bg-[#214C9B]" },
  { label: "Ámbar", value: "bg-amber-500" },
  { label: "Violeta", value: "bg-violet-500" },
];

type CompetitionEditorPanelProps = {
  onClose: () => void;
};

type EditorTab = "competicion" | "calendario";

function newZone(): CompetitionZoneRule {
  return {
    id: `zone-${Date.now()}`,
    label: "Nueva zona",
    count: 1,
    from: "top",
    colorClass: "bg-slate-500",
  };
}

export function CompetitionEditorPanel({ onClose }: CompetitionEditorPanelProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [gender, setGender] = useState<PrimerEquipoGender>("masculino");
  const [tab, setTab] = useState<EditorTab>("competicion");
  const [draft, setDraft] = useState<SeasonCompetitionConfigBundle | null>(null);
  const [fixtures, setFixtures] = useState<SeasonFixturesBundle | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<LeagueTemplateId | "">("");

  const stored = useMemo(
    () => getCompetitionConfigBundle(bundles, gender) ?? defaultCompetitionConfig(gender),
    [bundles, gender],
  );

  const loadConfigFromBundles = useCallback(() => {
    setDraft({ ...stored, zones: stored.zones.map((z) => ({ ...z })) });
  }, [stored]);

  const loadFixturesFromBundles = useCallback(() => {
    const cmsFixtures = getFixturesBundle(bundles, "masculino") as SeasonFixturesBundle | null;
    setFixtures(
      cmsFixtures?.matchdays?.length
        ? structuredClone(cmsFixtures)
        : { matchdays: [], meta: { lastRound: 0 } },
    );
  }, [bundles]);

  useEffect(() => {
    queueMicrotask(() => loadConfigFromBundles());
  }, [loadConfigFromBundles, gender]);

  useEffect(() => {
    queueMicrotask(() => loadFixturesFromBundles());
  }, [loadFixturesFromBundles]);

  const config = draft ?? stored;
  const fixturesDraft = fixtures ?? { matchdays: [], meta: { lastRound: 0 } };
  const rounds = leagueRoundCount(config.teamsPerGroup);
  const matchesPerRound = matchesPerLeagueRound(config.teamsPerGroup);
  const matchdayCount = fixturesDraft.matchdays.length;
  const matchCount = fixturesDraft.matchdays.reduce((sum, md) => sum + md.matches.length, 0);
  const matchdayGrupo2Count = fixturesDraft.matchdaysGrupo2?.length ?? 0;

  const updateZone = (id: string, patch: Partial<CompetitionZoneRule>) => {
    setDraft((current) => {
      const base = current ?? config;
      return {
        ...base,
        zones: base.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
      };
    });
  };

  const removeZone = (id: string) => {
    setDraft((current) => {
      const base = current ?? config;
      return { ...base, zones: base.zones.filter((z) => z.id !== id) };
    });
  };

  const saveConfig = async () => {
    setBusy(true);
    setMessage(null);
    const result = await upsertSeasonBundle(viewedSeasonId, gender, "competition_config", config);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar");
      return;
    }
    setMessage("Reglas de competición guardadas");
    await refreshBundles();
  };

  const generateFixtures = async () => {
    setBusy(true);
    setMessage(null);
    const payload = buildFixturesPayloadForConfig(gender, config, bundles);
    const result = await upsertSeasonBundle(viewedSeasonId, gender, "fixtures", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error");
      return;
    }
    setMessage(`Calendario generado: ${rounds} jornadas × ${matchesPerRound} partidos/grupo`);
    await refreshBundles();
    loadFixturesFromBundles();
  };

  const saveFixtures = async () => {
    if (!fixtures) return;
    setBusy(true);
    setMessage(null);
    const existing = getFixturesBundle(bundles, "masculino") as SeasonFixturesBundle | null;
    const payload: SeasonFixturesBundle = {
      ...existing,
      matchdays: fixtures.matchdays,
      matchdaysGrupo2: fixtures.matchdaysGrupo2,
      meta: fixtures.meta,
    };
    const result = await upsertSeasonBundle(viewedSeasonId, "masculino", "fixtures", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar calendario");
      return;
    }
    setMessage(`Calendario masculino guardado (${viewedSeason.label})`);
    await refreshBundles();
  };

  const applyTemplate = async () => {
    if (!selectedTemplateId) return;
    setBusy(true);
    setMessage(null);
    const result = await applyLeagueTemplate(viewedSeasonId, selectedTemplateId, {
      regenerateFixtures: true,
      bundles,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al aplicar plantilla");
      return;
    }
    setMessage("Plantilla aplicada (reglas y calendario vacío)");
    await refreshBundles();
  };

  const genderTemplates = leagueTemplatesForGender(gender);

  const footer = (
    <div className="flex flex-col gap-2">
      {tab === "competicion" ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveConfig()}
            className="w-full rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
          >
            Guardar reglas
          </button>
          <button
            type="button"
            disabled={busy || gender !== "masculino"}
            onClick={() => void generateFixtures()}
            className="w-full rounded-xl border border-[#214C9B]/30 px-4 py-2.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 disabled:opacity-60"
          >
            Generar casillas de jornadas
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveFixtures()}
          className="w-full rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
        >
          Guardar calendario
        </button>
      )}
    </div>
  );

  const editorBody = (
    <>
      <p className="mb-3 text-[10px] leading-relaxed text-slate-500">
        Masculino y femenino tienen calendarios separados. Para el femenino usa el panel{" "}
        <strong className="text-[#981915]">Femenino</strong> (competición y calendario como en cantera).
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["competicion", "Competición"],
            ["calendario", "Calendario"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            disabled={gender !== "masculino" && id === "calendario"}
            className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase ${
              tab === id ? "bg-[#214C9B] text-white" : "bg-slate-100 text-slate-600"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex gap-2">
        {(["masculino", "femenino"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGender(g);
              if (g === "femenino" && tab === "calendario") setTab("competicion");
            }}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-extrabold uppercase ${
              gender === g ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-slate-200 text-slate-600"
            }`}
          >
            {g === "masculino" ? "Masculino" : "Femenino"}
          </button>
        ))}
      </div>

      {tab === "calendario" && gender === "masculino" ? (
        <div className="space-y-4">
          <FixturesJsonPasteSection
            hint='Basta con jornadas, partidos (local, visitante) y fecha. Los goles no se importan. Tras aplicar, pulsa «Guardar calendario».'
            parse={(input) => parsePrimerEquipoFixturesJson(input, { gender: "masculino", bundles })}
            onImport={(data) => {
              setFixtures((current) => ({
                ...(current ?? fixturesDraft),
                matchdays: data.matchdays,
                matchdaysGrupo2: data.matchdaysGrupo2,
                meta: { ...(current?.meta ?? {}), lastRound: data.meta.lastRound },
              }));
            }}
          />

          <p className="text-[11px] font-semibold text-slate-600">
            Actual: {matchdayCount} jornadas grupo I
            {matchdayGrupo2Count > 0 ? ` · ${matchdayGrupo2Count} jornadas grupo II` : ""} · {matchCount} partidos
            en grupo I
          </p>
          <p className="text-[10px] leading-relaxed text-slate-500">
            Amistosos, Copa del Rey y partidos extra no se borran al guardar; solo se actualizan las jornadas de liga
            importadas.
          </p>
        </div>
      ) : null}

      {tab === "competicion" ? (
        <>
      <div className="mb-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Plantilla de liga</p>
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value as LeagueTemplateId | "")}
          className="w-full rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-semibold"
        >
          <option value="">— Elegir plantilla —</option>
          {genderTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {selectedTemplateId && (
          <p className="text-[10px] leading-relaxed text-slate-500">
            {genderTemplates.find((t) => t.id === selectedTemplateId)?.description}
          </p>
        )}
        <button
          type="button"
          disabled={busy || !selectedTemplateId}
          onClick={() => void applyTemplate()}
          className="w-full rounded-xl border border-[#214C9B]/30 px-3 py-2 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-white disabled:opacity-50"
        >
          Aplicar plantilla
        </button>
        <p className="text-[10px] text-slate-400">
          Sustituye reglas y calendario vacío. Puedes ajustar equipos, zonas y grupos después.
        </p>
        <p className="text-[10px] text-slate-400">
          Pretemporada, Copa del Rey y fases extra (playoff, playout…): en modo edición, abre Calendario o Competición → Copa
          y usa el panel «Pretemporada y Copa del Rey». En Jornadas puedes renombrar cada jornada (p. ej. «Playoff semis»).
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <label className="text-xs font-bold uppercase text-slate-500">
          Equipos / grupo
          <input
            type="number"
            min={2}
            max={30}
            value={config.teamsPerGroup}
            onChange={(e) =>
              setDraft((c) => ({ ...(c ?? config), teamsPerGroup: Math.max(2, Number(e.target.value) || 2) }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm font-semibold tabular-nums"
          />
        </label>
        <label className="text-xs font-bold uppercase text-slate-500">
          Grupos
          <select
            value={config.groupCount}
            onChange={(e) =>
              setDraft((c) => ({
                ...(c ?? config),
                groupCount: Number(e.target.value) === 2 ? 2 : 1,
              }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm font-semibold"
          >
            <option value={1}>1 grupo</option>
            <option value={2}>2 grupos</option>
          </select>
        </label>
      </div>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        Jornadas = (equipos − 1) × 2 = {rounds}
      </p>

      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase text-[#214C9B]">Zonas clasificación</h3>
        <button
          type="button"
          onClick={() => setDraft((c) => ({ ...(c ?? config), zones: [...(c ?? config).zones, newZone()] }))}
          className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#214C9B]"
        >
          <Plus size={12} /> Zona
        </button>
      </div>

      <ul className="space-y-3">
        {config.zones.map((zone) => (
          <li key={zone.id} className="rounded-xl border border-slate-200 p-2">
            <input
              value={zone.label}
              onChange={(e) => updateZone(zone.id, { label: e.target.value })}
              className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
            />
            <div className="grid grid-cols-3 gap-1">
              <input
                type="number"
                min={0}
                value={zone.count}
                onChange={(e) => updateZone(zone.id, { count: Math.max(0, Number(e.target.value) || 0) })}
                className="rounded-lg border border-slate-200 px-1 py-1 text-center text-xs font-bold"
                title="Plazas"
              />
              <select
                value={zone.from}
                onChange={(e) => updateZone(zone.id, { from: e.target.value as "top" | "bottom" })}
                className="rounded-lg border border-slate-200 px-1 py-1 text-[10px] font-bold"
              >
                <option value="top">Arriba</option>
                <option value="bottom">Abajo</option>
              </select>
              <select
                value={zone.colorClass}
                onChange={(e) => updateZone(zone.id, { colorClass: e.target.value })}
                className="rounded-lg border border-slate-200 px-1 py-1 text-[10px] font-bold"
              >
                {COLOR_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeZone(zone.id)}
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#981915]"
            >
              <Trash2 size={12} /> Quitar
            </button>
          </li>
        ))}
      </ul>
        </>
      ) : null}
    </>
  );

  return (
    <EditorPanelFrame
      title="Competición"
      subtitle={`${viewedSeason.label} · ${rounds} jornadas`}
      onClose={onClose}
      busy={busy}
      message={message}
      footer={footer}
    >
      {editorBody}
    </EditorPanelFrame>
  );
}
