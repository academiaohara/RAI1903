"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { useSeason } from "@/components/season/SeasonProvider";
import { applyLeagueTemplate, buildFixturesPayloadForConfig } from "@/lib/cms/apply-league-template";
import {
  defaultCompetitionConfig,
  getCompetitionConfigBundle,
  leagueRoundCount,
  matchesPerLeagueRound,
  type CompetitionZoneRule,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import {
  getFixturesBundle,
  upsertSeasonBundle,
  upsertSeasonBundlesBatch,
  type SeasonFemeninoFixturesBundle,
} from "@/lib/cms/season-bundles";
import { PLACEHOLDER_MATCH_DATE } from "@/lib/competition/normalize-fixtures";
import {
  leagueTemplatesForGender,
  type LeagueTemplateId,
} from "@/lib/competition/league-templates";
import { RAI_FEM_TEAM_ID } from "@/data/mock";
import type { Match, Matchday } from "@/types";

type EditorTab = "competicion" | "calendario";

type FemeninoEditorPanelProps = {
  onClose: () => void;
  variant?: "panel" | "inline";
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

function emptyMatch(round: number, index: number): Match {
  return {
    id: `cms-ph-f-j${round}-m${index}`,
    competition: "liga-femenina",
    matchday: round,
    date: PLACEHOLDER_MATCH_DATE,
    status: "scheduled",
    homeTeamId: `cms-slot-${index * 2 + 1}`,
    awayTeamId: `cms-slot-${index * 2 + 2}`,
    homeTeam: `Equipo ${index * 2 + 1}`,
    awayTeam: `Equipo ${index * 2 + 2}`,
    venue: "",
  };
}

export function FemeninoEditorPanel({ onClose, variant = "panel" }: FemeninoEditorPanelProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [tab, setTab] = useState<EditorTab>("competicion");
  const [config, setConfig] = useState<SeasonCompetitionConfigBundle | null>(null);
  const [fixtures, setFixtures] = useState<SeasonFemeninoFixturesBundle | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<LeagueTemplateId | "">("");

  const storedConfig = useMemo(
    () => getCompetitionConfigBundle(bundles, "femenino") ?? defaultCompetitionConfig("femenino"),
    [bundles],
  );

  const loadFromBundles = useCallback(() => {
    const cmsFixtures = getFixturesBundle(bundles, "femenino") as SeasonFemeninoFixturesBundle | null;
    setConfig(structuredClone(storedConfig));
    setFixtures(
      cmsFixtures?.matchdaysFemenino?.length
        ? structuredClone(cmsFixtures)
        : { matchdaysFemenino: [], meta: { lastRound: 0 } },
    );
  }, [bundles, storedConfig]);

  useEffect(() => {
    queueMicrotask(() => loadFromBundles());
  }, [loadFromBundles]);

  const competition = config ?? storedConfig;
  const fixturesDraft = fixtures ?? { matchdaysFemenino: [], meta: { lastRound: 0 } };
  const rounds = leagueRoundCount(competition.teamsPerGroup);
  const matchesPerRound = matchesPerLeagueRound(competition.teamsPerGroup);
  const genderTemplates = leagueTemplatesForGender("femenino");

  const jornadaNumbers = useMemo(
    () => [...fixturesDraft.matchdaysFemenino].sort((a, b) => a.round - b.round).map((md) => md.round),
    [fixturesDraft.matchdaysFemenino],
  );

  const ensureJornadaSlots = (targetRounds: number) => {
    setFixtures((current) => {
      const base = current ?? fixturesDraft;
      const existing = new Map(base.matchdaysFemenino.map((md) => [md.round, md]));
      const matchdaysFemenino: Matchday[] = [];
      for (let round = 1; round <= targetRounds; round += 1) {
        const md = existing.get(round);
        matchdaysFemenino.push(
          md ?? {
            round,
            matches: Array.from({ length: matchesPerRound }, (_, index) => emptyMatch(round, index)),
          },
        );
      }
      return { ...base, matchdaysFemenino };
    });
  };

  const saveAll = async () => {
    if (!config || !fixtures) return;
    setBusy(true);
    setMessage(null);
    const result = await upsertSeasonBundlesBatch(viewedSeasonId, [
      { scope: "femenino", bundleKey: "competition_config", payload: config },
      { scope: "femenino", bundleKey: "fixtures", payload: fixtures },
    ]);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar");
      return;
    }
    setMessage(`Femenino guardado (${viewedSeason.label})`);
    await refreshBundles();
  };

  const generateFixtures = async () => {
    setBusy(true);
    setMessage(null);
    const payload = buildFixturesPayloadForConfig("femenino", competition, bundles) as SeasonFemeninoFixturesBundle;
    const result = await upsertSeasonBundle(viewedSeasonId, "femenino", "fixtures", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error");
      return;
    }
    setMessage(`Calendario generado: ${rounds} jornadas × ${matchesPerRound} partidos`);
    await refreshBundles();
    loadFromBundles();
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
    setMessage("Plantilla femenina aplicada");
    await refreshBundles();
    loadFromBundles();
  };

  const updateZone = (id: string, patch: Partial<CompetitionZoneRule>) => {
    setConfig((current) => {
      const base = current ?? competition;
      return {
        ...base,
        zones: base.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
      };
    });
  };

  const footer = (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void saveAll()}
        className="w-full rounded-xl bg-[#981915] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#7a1412] disabled:opacity-60"
      >
        Guardar femenino
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void generateFixtures()}
        className="w-full rounded-xl border border-[#981915]/30 px-4 py-2.5 text-xs font-extrabold uppercase text-[#981915] hover:bg-red-50 disabled:opacity-60"
      >
        Generar casillas de jornadas
      </button>
    </div>
  );

  const editorBody = (
    <>
      <p className="mb-3 text-[10px] leading-relaxed text-slate-500">
        Calendario y competición femenina son independientes del masculino. Usa esta pestaña para la temporada que
        estés editando ({viewedSeason.label}).
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
            className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase ${
              tab === id ? "bg-[#981915] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "competicion" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
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
            <button
              type="button"
              disabled={busy || !selectedTemplateId}
              onClick={() => void applyTemplate()}
              className="w-full rounded-xl border border-[#981915]/30 px-3 py-2 text-[10px] font-extrabold uppercase text-[#981915] disabled:opacity-50"
            >
              Aplicar plantilla femenina
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-bold uppercase text-slate-500">
              Equipos / grupo
              <input
                type="number"
                min={2}
                max={30}
                value={competition.teamsPerGroup}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...(c ?? competition),
                    teamsPerGroup: Math.max(2, Number(e.target.value) || 2),
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm font-semibold tabular-nums"
              />
            </label>
            <div className="text-xs font-bold uppercase text-slate-500">
              Jornadas
              <p className="mt-2 text-sm font-extrabold text-[#981915] tabular-nums">{rounds}</p>
            </div>
          </div>

          <ul className="max-h-[40vh] space-y-3 overflow-y-auto pr-1">
            {competition.zones.map((zone) => (
              <li key={zone.id} className="rounded-xl border border-slate-200 p-2">
                <input
                  value={zone.label}
                  onChange={(e) => updateZone(zone.id, { label: e.target.value })}
                  className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() =>
                    setConfig((c) => ({
                      ...(c ?? competition),
                      zones: (c ?? competition).zones.filter((z) => z.id !== zone.id),
                    }))
                  }
                  className="text-[10px] font-bold text-[#981915]"
                >
                  <Trash2 size={12} className="inline" /> Quitar
                </button>
              </li>
            ))}
            <button
              type="button"
              onClick={() =>
                setConfig((c) => ({ ...(c ?? competition), zones: [...(c ?? competition).zones, newZone()] }))
              }
              className="text-[10px] font-extrabold uppercase text-[#981915]"
            >
              <Plus size={12} className="inline" /> Zona
            </button>
          </ul>
        </div>
      )}

      {tab === "calendario" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => ensureJornadaSlots(rounds)}
            className="rounded-lg border border-[#981915]/25 px-3 py-2 text-[10px] font-extrabold uppercase text-[#981915]"
          >
            Crear casillas de jornadas ({rounds})
          </button>

          <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
            {jornadaNumbers.map((round) => {
              const matchday = fixturesDraft.matchdaysFemenino.find((md) => md.round === round)!;
              return (
                <div key={round} className="rounded-xl border border-slate-100 p-3">
                  <p className="mb-2 text-xs font-extrabold uppercase text-[#981915]">Jornada {round}</p>
                  {matchday.matches.map((match, mIndex) => {
                    const isRai =
                      match.homeTeamId === RAI_FEM_TEAM_ID || match.awayTeamId === RAI_FEM_TEAM_ID;
                    return (
                      <div
                        key={match.id}
                        className={`mb-2 rounded-lg p-2 space-y-2 ${isRai ? "bg-[#981915]/8" : "bg-slate-50"}`}
                      >
                        <input
                          placeholder="Local"
                          value={match.homeTeam}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const matchdaysFemenino = f.matchdaysFemenino.map((md) => {
                                if (md.round !== round) return md;
                                const matches = [...md.matches];
                                matches[mIndex] = { ...matches[mIndex]!, homeTeam: e.target.value };
                                return { ...md, matches };
                              });
                              return { ...f, matchdaysFemenino };
                            })
                          }
                          className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                        <input
                          placeholder="Visitante"
                          value={match.awayTeam}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const matchdaysFemenino = f.matchdaysFemenino.map((md) => {
                                if (md.round !== round) return md;
                                const matches = [...md.matches];
                                matches[mIndex] = { ...matches[mIndex]!, awayTeam: e.target.value };
                                return { ...md, matches };
                              });
                              return { ...f, matchdaysFemenino };
                            })
                          }
                          className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  if (variant === "inline") {
    return (
      <div className="rounded-2xl border border-[#981915]/20 bg-white p-4 shadow-sm">
        {editorBody}
        <div className="mt-4">{footer}</div>
        {message && <p className="mt-2 text-xs font-semibold text-slate-600">{message}</p>}
      </div>
    );
  }

  return (
    <EditorPanelFrame
      title="Femenino"
      subtitle={`${viewedSeason.label} · calendario independiente`}
      onClose={onClose}
      busy={busy}
      message={message}
      footer={footer}
    >
      {editorBody}
    </EditorPanelFrame>
  );
}
