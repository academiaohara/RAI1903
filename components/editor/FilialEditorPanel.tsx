"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { FixturesJsonPasteSection } from "@/components/editor/FixturesJsonPasteSection";
import { OnPageEditorSection } from "@/components/editor/OnPageEditorSection";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  defaultFilialCompetitionConfig,
  type FilialCompetitionConfigBundle,
  type FilialFixturePartido,
  type FilialFixturesBundle,
  type FilialTeamSeed,
} from "@/lib/cms/filial-bundles";
import { parseCanteraFixturesJson } from "@/lib/cms/parse-fixtures-json";
import { upsertSeasonBundlesBatch } from "@/lib/cms/season-bundles";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import { buildCanteraMockBundleEntries } from "@/lib/cantera/cantera-season-data";
import { defaultJuvenilCompetitionConfig } from "@/lib/cantera/juvenil-season-data";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import type { CanteraSquadImport, CanteraSquadImportPlayer } from "@/types/cantera-squad-import";

const CANTERA_EDITOR_META: Record<
  CanteraCmsScope,
  { title: string; shortTitle: string; defaultLocal: string; defaultCompeticion: string }
> = {
  filial: {
    title: "Filial (Real Avilés B)",
    shortTitle: "filial",
    defaultLocal: "Real Avilés B",
    defaultCompeticion: "2ª Asturfútbol",
  },
  juvenil: {
    title: "Juvenil A (Real Avilés U19)",
    shortTitle: "juvenil",
    defaultLocal: "Real Avilés U19",
    defaultCompeticion: "Liga Nacional Juvenil",
  },
};

const COLOR_PRESETS = [
  { label: "Verde", value: "bg-emerald-500" },
  { label: "Azul claro", value: "bg-sky-400" },
  { label: "Rosa", value: "bg-rose-500" },
  { label: "Azul club", value: "bg-[#214C9B]" },
  { label: "Ámbar", value: "bg-amber-500" },
];

type EditorTab = "plantilla" | "calendario" | "competicion";

type CanteraEditorPanelProps = {
  scope: CanteraCmsScope;
  onClose?: () => void;
  variant?: "panel" | "inline";
};

type FilialEditorPanelProps = {
  onClose?: () => void;
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

function emptyPlayer(): CanteraSquadImportPlayer {
  return {
    dorsal: null,
    jugador: "Nuevo jugador",
    pos: "Centrocampista",
    edad: null,
    pc: 0,
    pj: 0,
    pt: 0,
    min: 0,
    goles: 0,
    ta: 0,
    tr: 0,
  };
}

function emptyPartido(defaultLocal: string): FilialFixturePartido {
  const today = new Date().toISOString().slice(0, 10);
  return {
    fecha: today,
    hora: null,
    local: defaultLocal,
    visitante: "Rival",
    goles_local: null,
    goles_visitante: null,
    estado: "pendiente",
  };
}

const STAT_FIELDS: Array<{
  key: keyof Pick<CanteraSquadImportPlayer, "pc" | "pj" | "pt" | "min" | "goles" | "ta" | "tr">;
  label: string;
}> = [
  { key: "pc", label: "PC" },
  { key: "pj", label: "PJ" },
  { key: "pt", label: "PT" },
  { key: "min", label: "Min" },
  { key: "goles", label: "Goles" },
  { key: "ta", label: "TA" },
  { key: "tr", label: "TR" },
];

export function CanteraEditorPanel({ scope, onClose, variant = "panel" }: CanteraEditorPanelProps) {
  const meta = CANTERA_EDITOR_META[scope];
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [tab, setTab] = useState<EditorTab>("plantilla");
  const [squad, setSquad] = useState<CanteraSquadImport | null>(null);
  const [fixtures, setFixtures] = useState<FilialFixturesBundle | null>(null);
  const [config, setConfig] = useState<FilialCompetitionConfigBundle | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadFromBundles = useCallback(() => {
    const mockEntries = buildCanteraMockBundleEntries(scope);
    const mockSquad = mockEntries.find((e) => e.bundleKey === "squad")!.payload as CanteraSquadImport;
    const mockFixtures = mockEntries.find((e) => e.bundleKey === "fixtures")!.payload as FilialFixturesBundle;
    const mockConfig = mockEntries.find((e) => e.bundleKey === "competition_config")!
      .payload as FilialCompetitionConfigBundle;

    const cmsSquad = bundles[`${scope}:squad`] as CanteraSquadImport | undefined;
    const cmsFixtures = bundles[`${scope}:fixtures`] as FilialFixturesBundle | undefined;
    const cmsConfig = bundles[`${scope}:competition_config`] as FilialCompetitionConfigBundle | undefined;

    setSquad(cmsSquad?.plantilla?.length ? structuredClone(cmsSquad) : structuredClone(mockSquad));
    setFixtures(
      cmsFixtures?.jornadas?.length ? structuredClone(cmsFixtures) : structuredClone(mockFixtures),
    );
    setConfig(structuredClone(cmsConfig ?? mockConfig));
  }, [bundles, scope]);

  useEffect(() => {
    queueMicrotask(() => loadFromBundles());
  }, [loadFromBundles]);

  const defaultConfig =
    scope === "filial" ? defaultFilialCompetitionConfig() : defaultJuvenilCompetitionConfig();
  const competition = config ?? defaultConfig;
  const fixturesDraft = fixtures ?? { competicion: meta.defaultCompeticion, jornadas: [] };
  const squadDraft = squad ?? { entrenador: "", mediaEdad: 0, plantilla: [] };

  const jornadaNumbers = useMemo(
    () => [...fixturesDraft.jornadas].sort((a, b) => a.jornada - b.jornada).map((j) => j.jornada),
    [fixturesDraft.jornadas],
  );

  const saveAll = async () => {
    if (!squad || !fixtures || !config) return;
    setBusy(true);
    setMessage(null);
    const result = await upsertSeasonBundlesBatch(viewedSeasonId, [
      { scope, bundleKey: "squad", payload: squad },
      { scope, bundleKey: "fixtures", payload: fixtures },
      { scope, bundleKey: "competition_config", payload: config },
    ]);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar");
      return;
    }
    setMessage(`${meta.shortTitle} guardado (${viewedSeason.label})`);
    await refreshBundles();
  };

  const importMock = async () => {
    setBusy(true);
    setMessage(null);
    const entries = buildCanteraMockBundleEntries(scope);
    const result = await upsertSeasonBundlesBatch(
      viewedSeasonId,
      entries.map((entry) => ({
        scope: entry.scope,
        bundleKey: entry.bundleKey,
        payload: entry.payload,
      })),
    );
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al importar");
      return;
    }
    setMessage("Datos del repo importados");
    await refreshBundles();
    loadFromBundles();
  };

  const ensureJornadaSlots = (targetRounds: number) => {
    setFixtures((current) => {
      const base = current ?? fixturesDraft;
      const existing = new Map(base.jornadas.map((j) => [j.jornada, j]));
      const jornadas = [];
      for (let round = 1; round <= targetRounds; round += 1) {
        jornadas.push(existing.get(round) ?? { jornada: round, partidos: [] });
      }
      return { ...base, jornadas };
    });
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

  const updateTeam = (id: string, patch: Partial<FilialTeamSeed>) => {
    setConfig((current) => {
      const base = current ?? competition;
      return {
        ...base,
        teams: base.teams.map((team) => (team.id === id ? { ...team, ...patch } : team)),
      };
    });
  };

  const footer = (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void saveAll()}
        className="w-full rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
      >
        Guardar {meta.shortTitle}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void importMock()}
        className="w-full rounded-xl border border-[#214C9B]/30 px-4 py-2.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 disabled:opacity-60"
      >
        Importar datos 25/26 del repo
      </button>
    </div>
  );

  const editorBody = (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["plantilla", "Plantilla"],
            ["calendario", "Calendario"],
            ["competicion", "Competición"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase ${
              tab === id ? "bg-[#214C9B] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "plantilla" && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-600">
            Entrenador
            <input
              value={squadDraft.entrenador}
              onChange={(e) => setSquad((s) => (s ? { ...s, entrenador: e.target.value } : s))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Media de edad
            <input
              type="number"
              step="0.1"
              value={squadDraft.mediaEdad}
              onChange={(e) =>
                setSquad((s) => (s ? { ...s, mediaEdad: Number(e.target.value) || 0 } : s))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {squadDraft.plantilla.length} jugadores
            </p>
            <button
              type="button"
              onClick={() => setSquad((s) => (s ? { ...s, plantilla: [...s.plantilla, emptyPlayer()] } : s))}
              className="inline-flex items-center gap-1 rounded-lg bg-[#214C9B]/10 px-2 py-1 text-[10px] font-extrabold uppercase text-[#214C9B]"
            >
              <Plus size={12} /> Añadir jugador
            </button>
          </div>

          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {squadDraft.plantilla.map((player, index) => (
              <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Jugador {index + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setSquad((s) =>
                        s ? { ...s, plantilla: s.plantilla.filter((_, i) => i !== index) } : s,
                      )
                    }
                    className="text-rose-600"
                    aria-label="Eliminar jugador"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Nombre completo"
                    value={player.jugador}
                    onChange={(e) =>
                      setSquad((s) => {
                        if (!s) return s;
                        const plantilla = [...s.plantilla];
                        plantilla[index] = { ...plantilla[index]!, jugador: e.target.value };
                        return { ...s, plantilla };
                      })
                    }
                    className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Dorsal"
                    type="number"
                    value={player.dorsal ?? ""}
                    onChange={(e) =>
                      setSquad((s) => {
                        if (!s) return s;
                        const plantilla = [...s.plantilla];
                        plantilla[index] = {
                          ...plantilla[index]!,
                          dorsal: e.target.value === "" ? null : Number(e.target.value),
                        };
                        return { ...s, plantilla };
                      })
                    }
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Posición"
                    value={player.pos}
                    onChange={(e) =>
                      setSquad((s) => {
                        if (!s) return s;
                        const plantilla = [...s.plantilla];
                        plantilla[index] = { ...plantilla[index]!, pos: e.target.value };
                        return { ...s, plantilla };
                      })
                    }
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  {STAT_FIELDS.map(({ key, label }) => (
                    <input
                      key={key}
                      placeholder={label}
                      type="number"
                      min={0}
                      value={player[key]}
                      onChange={(e) =>
                        setSquad((s) => {
                          if (!s) return s;
                          const plantilla = [...s.plantilla];
                          plantilla[index] = {
                            ...plantilla[index]!,
                            [key]: Number(e.target.value) || 0,
                          };
                          return { ...s, plantilla };
                        })
                      }
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  ))}
                  {player.pos.toLowerCase().includes("portero") ? (
                    <input
                      placeholder="Encajados"
                      type="number"
                      min={0}
                      value={player.golesEncajados ?? ""}
                      onChange={(e) =>
                        setSquad((s) => {
                          if (!s) return s;
                          const plantilla = [...s.plantilla];
                          plantilla[index] = {
                            ...plantilla[index]!,
                            golesEncajados:
                              e.target.value === "" ? undefined : Number(e.target.value) || 0,
                          };
                          return { ...s, plantilla };
                        })
                      }
                      className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "calendario" && (
        <div className="space-y-4">
          <FixturesJsonPasteSection
            hint='Basta con jornadas, partidos (local, visitante) y fecha de cada partido. Los goles no se importan: quedan pendientes para rellenarlos a mano. Tras aplicar, pulsa «Guardar».'
            onImport={(data) => {
              setFixtures(data);
              const lastRound = data.jornadas.at(-1)?.jornada ?? 0;
              if (lastRound > 0) {
                setConfig((current) => {
                  const base = current ?? competition;
                  return { ...base, leagueRounds: Math.max(base.leagueRounds, lastRound) };
                });
              }
            }}
            parse={parseCanteraFixturesJson}
          />

          <label className="block text-xs font-semibold text-slate-600">
            Nombre competición
            <input
              value={fixturesDraft.competicion}
              onChange={(e) => setFixtures((f) => (f ? { ...f, competicion: e.target.value } : f))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Jornadas en la liga
              <input
                type="number"
                min={0}
                value={competition.leagueRounds}
                onChange={(e) => {
                  const leagueRounds = Math.max(0, Number(e.target.value) || 0);
                  setConfig((c) => (c ? { ...c, leagueRounds } : c));
                  ensureJornadaSlots(leagueRounds);
                }}
                className="mt-1 block w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => ensureJornadaSlots(competition.leagueRounds)}
              className="rounded-lg border border-[#214C9B]/25 px-3 py-2 text-[10px] font-extrabold uppercase text-[#214C9B]"
            >
              Crear casillas de jornadas
            </button>
          </div>

          <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
            {jornadaNumbers.map((round) => {
              const jornada = fixturesDraft.jornadas.find((j) => j.jornada === round)!;
              return (
                <div key={round} className="rounded-xl border border-slate-100 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase text-[#214C9B]">Jornada {round}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setFixtures((f) => {
                          if (!f) return f;
                          const jornadas = f.jornadas.map((j) =>
                            j.jornada === round
                              ? { ...j, partidos: [...j.partidos, emptyPartido(meta.defaultLocal)] }
                              : j,
                          );
                          return { ...f, jornadas };
                        })
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#214C9B]"
                    >
                      <Plus size={12} /> Partido
                    </button>
                  </div>
                  {jornada.partidos.map((partido, pIndex) => (
                    <div key={pIndex} className="mb-2 rounded-lg bg-slate-50 p-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={partido.fecha}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const jornadas = f.jornadas.map((j) => {
                                if (j.jornada !== round) return j;
                                const partidos = [...j.partidos];
                                partidos[pIndex] = { ...partidos[pIndex]!, fecha: e.target.value };
                                return { ...j, partidos };
                              });
                              return { ...f, jornadas };
                            })
                          }
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                        <select
                          value={partido.estado ?? "pendiente"}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const estado = e.target.value as "finalizado" | "pendiente";
                              const jornadas = f.jornadas.map((j) => {
                                if (j.jornada !== round) return j;
                                const partidos = [...j.partidos];
                                partidos[pIndex] = { ...partidos[pIndex]!, estado };
                                return { ...j, partidos };
                              });
                              return { ...f, jornadas };
                            })
                          }
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                        <input
                          placeholder="Local"
                          value={partido.local}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const jornadas = f.jornadas.map((j) => {
                                if (j.jornada !== round) return j;
                                const partidos = [...j.partidos];
                                partidos[pIndex] = { ...partidos[pIndex]!, local: e.target.value };
                                return { ...j, partidos };
                              });
                              return { ...f, jornadas };
                            })
                          }
                          className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                        <input
                          placeholder="Visitante"
                          value={partido.visitante}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const jornadas = f.jornadas.map((j) => {
                                if (j.jornada !== round) return j;
                                const partidos = [...j.partidos];
                                partidos[pIndex] = { ...partidos[pIndex]!, visitante: e.target.value };
                                return { ...j, partidos };
                              });
                              return { ...f, jornadas };
                            })
                          }
                          className="col-span-2 rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                        <input
                          placeholder="Goles local"
                          type="number"
                          value={partido.goles_local ?? ""}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const jornadas = f.jornadas.map((j) => {
                                if (j.jornada !== round) return j;
                                const partidos = [...j.partidos];
                                partidos[pIndex] = {
                                  ...partidos[pIndex]!,
                                  goles_local: e.target.value === "" ? null : Number(e.target.value),
                                };
                                return { ...j, partidos };
                              });
                              return { ...f, jornadas };
                            })
                          }
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                        <input
                          placeholder="Goles visitante"
                          type="number"
                          value={partido.goles_visitante ?? ""}
                          onChange={(e) =>
                            setFixtures((f) => {
                              if (!f) return f;
                              const jornadas = f.jornadas.map((j) => {
                                if (j.jornada !== round) return j;
                                const partidos = [...j.partidos];
                                partidos[pIndex] = {
                                  ...partidos[pIndex]!,
                                  goles_visitante: e.target.value === "" ? null : Number(e.target.value),
                                };
                                return { ...j, partidos };
                              });
                              return { ...f, jornadas };
                            })
                          }
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFixtures((f) => {
                            if (!f) return f;
                            const jornadas = f.jornadas.map((j) =>
                              j.jornada === round
                                ? { ...j, partidos: j.partidos.filter((_, i) => i !== pIndex) }
                                : j,
                            );
                            return { ...f, jornadas };
                          })
                        }
                        className="text-[10px] font-bold uppercase text-rose-600"
                      >
                        Eliminar partido
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "competicion" && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-600">
            Etiqueta liga
            <input
              value={competition.ligaLabel ?? ""}
              onChange={(e) => setConfig((c) => (c ? { ...c, ligaLabel: e.target.value } : c))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Equipos del grupo</p>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {competition.teams.map((team) => (
              <div key={team.id} className="grid grid-cols-[1fr_5rem] gap-2">
                <input
                  value={team.name}
                  onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                />
                <input
                  value={team.shortName}
                  onChange={(e) => updateTeam(team.id, { shortName: e.target.value })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  placeholder="Corto"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Tramos clasificación</p>
            <button
              type="button"
              onClick={() =>
                setConfig((c) => (c ? { ...c, zones: [...c.zones, newZone()] } : c))
              }
              className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#214C9B]"
            >
              <Plus size={12} /> Zona
            </button>
          </div>

          {competition.zones.map((zone) => (
            <div key={zone.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
              <div className="flex justify-between">
                <input
                  value={zone.label}
                  onChange={(e) => updateZone(zone.id, { label: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() =>
                    setConfig((c) => (c ? { ...c, zones: c.zones.filter((z) => z.id !== zone.id) } : c))
                  }
                  className="ml-2 text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min={1}
                  value={zone.count}
                  onChange={(e) => updateZone(zone.id, { count: Number(e.target.value) || 1 })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  title="Plazas"
                />
                <select
                  value={zone.from}
                  onChange={(e) => updateZone(zone.id, { from: e.target.value as "top" | "bottom" })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  <option value="top">Arriba</option>
                  <option value="bottom">Abajo</option>
                </select>
                <select
                  value={zone.colorClass}
                  onChange={(e) => updateZone(zone.id, { colorClass: e.target.value })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  {COLOR_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (variant === "inline") {
    return (
      <OnPageEditorSection
        title={`Editar ${meta.title}`}
        description={`${viewedSeason.label} · plantilla, calendario y competición. La clasificación se calcula desde los resultados.`}
      >
        {editorBody}
        {message ? (
          <p
            className={`mt-3 text-xs font-bold ${message.includes("Error") ? "text-[#981915]" : "text-emerald-700"}`}
          >
            {message}
          </p>
        ) : null}
        <div className="mt-4">{footer}</div>
        {busy ? (
          <p className="mt-2 text-xs font-bold text-slate-500">Guardando…</p>
        ) : null}
      </OnPageEditorSection>
    );
  }

  return (
    <EditorPanelFrame
      title={meta.title}
      subtitle={`${viewedSeason.label} · clasificación calculada desde resultados`}
      onClose={onClose ?? (() => {})}
      busy={busy}
      message={message}
      footer={footer}
    >
      {editorBody}
    </EditorPanelFrame>
  );
}

export function FilialEditorPanel(props: FilialEditorPanelProps) {
  return <CanteraEditorPanel scope="filial" {...props} />;
}

export function JuvenilEditorPanel(props: FilialEditorPanelProps) {
  return <CanteraEditorPanel scope="juvenil" {...props} />;
}
