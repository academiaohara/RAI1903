"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  defaultCompetitionConfig,
  leagueRoundCount,
  matchesPerLeagueRound,
  type CompetitionZoneRule,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import { getCompetitionConfigBundle } from "@/lib/cms/competition-config-bundle";
import { upsertSeasonBundle, getFixturesBundle } from "@/lib/cms/season-bundles";
import type { SeasonFixturesBundle, SeasonFemeninoFixturesBundle } from "@/lib/cms/season-bundles";
import { normalizeGrupo2Matchdays, normalizeLeagueMatchdays } from "@/lib/competition/normalize-fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";

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
  const [draft, setDraft] = useState<SeasonCompetitionConfigBundle | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stored = useMemo(
    () => getCompetitionConfigBundle(bundles, gender) ?? defaultCompetitionConfig(gender),
    [bundles, gender],
  );

  useEffect(() => {
    queueMicrotask(() => setDraft({ ...stored, zones: stored.zones.map((z) => ({ ...z })) }));
  }, [stored, gender]);

  const config = draft ?? stored;
  const rounds = leagueRoundCount(config.teamsPerGroup);
  const matchesPerRound = matchesPerLeagueRound(config.teamsPerGroup);

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
    const source = fixtureSourceFromBundles(bundles, gender);
    if (gender === "femenino") {
      const matchdaysFemenino = normalizeLeagueMatchdays(source.matchdaysFemenino, config);
      const payload: SeasonFemeninoFixturesBundle = {
        matchdaysFemenino,
        meta: { lastRound: 0 },
      };
      const result = await upsertSeasonBundle(viewedSeasonId, gender, "fixtures", payload);
      setBusy(false);
      if (!result.ok) {
        setMessage(result.error ?? "Error");
        return;
      }
    } else {
      const matchdays = normalizeLeagueMatchdays(source.matchdays, config);
      const matchdaysGrupo2 =
        config.groupCount >= 2 ? normalizeGrupo2Matchdays(source.matchdaysGrupo2, config) : undefined;
      const existing = getFixturesBundle(bundles, gender) as SeasonFixturesBundle | null;
      const payload: SeasonFixturesBundle = {
        matchdays,
        matchdaysGrupo2,
        amistosoMatches: existing?.amistosoMatches,
        copaDelReyMatches: existing?.copaDelReyMatches,
        meta: { lastRound: 0, definitiveQualifyingLeagueRound: 0 },
      };
      const result = await upsertSeasonBundle(viewedSeasonId, gender, "fixtures", payload);
      setBusy(false);
      if (!result.ok) {
        setMessage(result.error ?? "Error");
        return;
      }
    }
    setMessage(`Calendario generado: ${rounds} jornadas × ${matchesPerRound} partidos/grupo`);
    await refreshBundles();
  };

  return (
    <EditorPanelFrame
      title="Competición"
      subtitle={`${viewedSeason.label} · ${rounds} jornadas`}
      onClose={onClose}
      busy={busy}
      message={message}
      footer={
        <div className="flex flex-col gap-2">
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
            disabled={busy}
            onClick={() => void generateFixtures()}
            className="w-full rounded-xl border border-[#214C9B]/30 px-4 py-2.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 disabled:opacity-60"
          >
            Generar casillas de jornadas
          </button>
        </div>
      }
    >
      <div className="mb-3 flex gap-2">
        {(["masculino", "femenino"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-extrabold uppercase ${
              gender === g ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-slate-200 text-slate-600"
            }`}
          >
            {g === "masculino" ? "Masculino" : "Femenino"}
          </button>
        ))}
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

      <label className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-slate-600">
        <input
          type="checkbox"
          checked={config.hasPlayoff}
          onChange={(e) => setDraft((c) => ({ ...(c ?? config), hasPlayoff: e.target.checked }))}
          className="rounded border-slate-300"
        />
        Hay playoff de ascenso
      </label>

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
    </EditorPanelFrame>
  );
}
