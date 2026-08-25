"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { OnPageEditorSection } from "@/components/editor/OnPageEditorSection";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  getRivalSquadsBundle,
  withRivalSquadInBundle,
} from "@/lib/cms/rival-squads-bundle";
import { upsertSeasonBundle } from "@/lib/cms/season-bundles";
import { parseRivalSquadJson, serializeRivalSquadPlantillaJson } from "@/lib/rival-squad-json";
import { buildDefaultRivalSquadImport } from "@/lib/rival-squad-defaults";
import { RIVAL_SQUAD_FOOT_OPTIONS, RIVAL_SQUAD_POS_OPTIONS } from "@/lib/rival-squad-positions";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Team } from "@/types";
import type { RivalSquadImport, RivalSquadImportPlayer } from "@/types/rival-squad-import";

const STAT_FIELDS = [
  { key: "pj" as const, label: "PJ" },
  { key: "g" as const, label: "G" },
  { key: "a" as const, label: "A" },
  { key: "ta" as const, label: "TA" },
  { key: "tr" as const, label: "TR" },
];

const JSON_PLACEHOLDER = `[
  {
    "dorsal": 13,
    "jugador": "Fran Árbol",
    "pos": "Portero",
    "edad": 28,
    "pie": "Izquierdo",
    "altura": "1,88 m"
  }
]`;

function emptyPlayer(): RivalSquadImportPlayer {
  return {
    dorsal: null,
    jugador: "",
    pos: "Centrocampista",
    edad: null,
    pie: "Derecho",
    altura: null,
    pj: 0,
    g: 0,
    a: 0,
    ta: 0,
    tr: 0,
    valor: null,
    contrato: null,
  };
}

type EditorTab = "formulario" | "json";

type RivalSquadOnPageEditorProps = {
  gender: PrimerEquipoGender;
  team: Team;
};

export function RivalSquadOnPageEditor({ gender, team }: RivalSquadOnPageEditorProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const stored = useMemo(() => getRivalSquadsBundle(bundles, gender).squads[team.id], [bundles, gender, team.id]);

  const [draft, setDraft] = useState<RivalSquadImport | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<EditorTab>("formulario");
  const [jsonText, setJsonText] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setDraft(stored?.plantilla?.length ? structuredClone(stored) : buildDefaultRivalSquadImport(team));
      setMessage(null);
      setJsonDirty(false);
    });
  }, [stored, team]);

  const squadDraft = draft ?? buildDefaultRivalSquadImport(team);
  const displayedJson = jsonDirty ? jsonText : serializeRivalSquadPlantillaJson(squadDraft.plantilla);

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setMessage(null);
    const bundle = withRivalSquadInBundle(getRivalSquadsBundle(bundles, gender), team.id, draft);
    const result = await upsertSeasonBundle(viewedSeasonId, gender, "rival_squads", bundle);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar plantilla");
      return;
    }
    setMessage(`Plantilla guardada (${viewedSeason.label})`);
    await refreshBundles();
  };

  const resetFromDefaults = () => {
    setDraft(buildDefaultRivalSquadImport(team));
    setJsonDirty(false);
    setMessage("Borrador restaurado (guarda para aplicar en Supabase)");
  };

  const applyJsonToDraft = () => {
    try {
      const source = jsonDirty ? jsonText : displayedJson;
      const parsed = JSON.parse(source) as unknown;
      const result = parseRivalSquadJson(parsed, squadDraft);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setDraft(result.data);
      setJsonDirty(false);
      setMessage(`JSON aplicado: ${result.data.plantilla.length} jugadores (guarda para publicar).`);
    } catch {
      setMessage("JSON inválido.");
    }
  };

  const syncJsonFromForm = () => {
    setJsonDirty(false);
    setJsonText("");
    setMessage("JSON actualizado desde el formulario.");
  };

  return (
    <OnPageEditorSection
      title={`Plantilla rival · ${team.name}`}
      description={`Temporada ${viewedSeason.label}. Esta plantilla es solo de esta temporada; no reutiliza la del año pasado salvo que dupliques la temporada entera.`}
    >
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-slate-600">
          Estadio
          <input
            value={squadDraft.estadio}
            onChange={(e) => setDraft((s) => (s ? { ...s, estadio: e.target.value } : s))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-slate-600">
            Capacidad
            <input
              type="number"
              value={squadDraft.capacidad}
              onChange={(e) =>
                setDraft((s) => (s ? { ...s, capacidad: Number(e.target.value) || 0 } : s))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Entrenador
            <input
              value={squadDraft.entrenador}
              onChange={(e) => setDraft((s) => (s ? { ...s, entrenador: e.target.value } : s))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["formulario", "Formulario"],
              ["json", "JSON editable"],
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

        <div className="rounded-xl border border-dashed border-[#214C9B]/25 bg-slate-50/80 p-3">
          <p className="text-xs font-extrabold text-[#214C9B]">Formato de cada jugador</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[11px] text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-left font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-1 pr-3">Campo</th>
                  <th className="py-1 pr-3">Tipo</th>
                  <th className="py-1">Ejemplo / notas</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-semibold text-slate-800">jugador</td>
                  <td className="py-1.5 pr-3">string</td>
                  <td className="py-1.5">Nombre completo · «Fran Árbol»</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-semibold text-slate-800">dorsal</td>
                  <td className="py-1.5 pr-3">number | null</td>
                  <td className="py-1.5">1–99 o null si no tiene dorsal</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-semibold text-slate-800">pos</td>
                  <td className="py-1.5 pr-3">string</td>
                  <td className="py-1.5">Ver tabla de posiciones abajo</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-semibold text-slate-800">edad</td>
                  <td className="py-1.5 pr-3">number | null</td>
                  <td className="py-1.5">Años cumplidos · 28</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-semibold text-slate-800">pie</td>
                  <td className="py-1.5 pr-3">string</td>
                  <td className="py-1.5">
                    {RIVAL_SQUAD_FOOT_OPTIONS.join(" · ")} (también Derecha / Izquierda)
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-3 font-semibold text-slate-800">altura</td>
                  <td className="py-1.5 pr-3">string</td>
                  <td className="py-1.5">Con coma decimal · «1,85 m»</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-600">
            Posiciones (<code className="rounded bg-white px-1">pos</code>) y abreviatura en la web (columna Pos.):
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[11px] text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-left font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-1 pr-3">pos (JSON)</th>
                  <th className="py-1 pr-3">Grupo</th>
                  <th className="py-1">Web</th>
                </tr>
              </thead>
              <tbody>
                {RIVAL_SQUAD_POS_OPTIONS.map((option) => (
                  <tr key={option.value} className="border-b border-slate-100">
                    <td className="py-1 pr-3 font-mono">{option.value}</td>
                    <td className="py-1 pr-3">{option.grupo}</td>
                    <td className="py-1 font-mono font-bold text-[#214C9B]">{option.web}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tab === "json" ? (
          <div className="space-y-2 rounded-xl border border-[#214C9B]/20 bg-white p-3">
            <p className="text-xs font-extrabold text-[#214C9B]">Plantilla en JSON</p>
            <p className="text-[11px] text-slate-600">
              Edita la lista de jugadores y pulsa «Aplicar JSON». También puedes pegar un array o un objeto con{" "}
              <code className="rounded bg-slate-100 px-1">plantilla</code>.
            </p>
            <textarea
              value={displayedJson}
              onChange={(event) => {
                setJsonText(event.target.value);
                setJsonDirty(true);
              }}
              rows={14}
              spellCheck={false}
              placeholder={JSON_PLACEHOLDER}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyJsonToDraft}
                className="rounded-lg bg-[#214C9B] px-3 py-1.5 text-xs font-extrabold text-white"
              >
                Aplicar JSON al borrador
              </button>
              <button
                type="button"
                onClick={syncJsonFromForm}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
              >
                Recargar desde formulario
              </button>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(displayedJson);
                  setMessage("JSON copiado al portapapeles.");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
              >
                Copiar JSON
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {squadDraft.plantilla.length} jugadores
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetFromDefaults}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-extrabold uppercase text-slate-600 hover:bg-white"
                >
                  Restaurar borrador
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((s) =>
                      s
                        ? {
                            ...s,
                            plantilla: [...s.plantilla, emptyPlayer()],
                          }
                        : s,
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-[#214C9B]/10 px-2 py-1 text-[10px] font-extrabold uppercase text-[#214C9B]"
                >
                  <Plus size={12} /> Añadir jugador
                </button>
              </div>
            </div>

            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {squadDraft.plantilla.map((player, index) => (
                <div key={index} className="space-y-2 rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Jugador {index + 1}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((s) =>
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
                    <label className="col-span-2 block text-[10px] font-bold uppercase text-slate-500">
                      Nombre (jugador)
                      <input
                        placeholder="Nombre completo"
                        value={player.jugador}
                        onChange={(e) =>
                          setDraft((s) => {
                            if (!s) return s;
                            const plantilla = [...s.plantilla];
                            plantilla[index] = { ...plantilla[index]!, jugador: e.target.value };
                            return { ...s, plantilla };
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                      />
                    </label>
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      Dorsal
                      <input
                        placeholder="Dorsal"
                        type="number"
                        value={player.dorsal ?? ""}
                        onChange={(e) =>
                          setDraft((s) => {
                            if (!s) return s;
                            const plantilla = [...s.plantilla];
                            plantilla[index] = {
                              ...plantilla[index]!,
                              dorsal: e.target.value === "" ? null : Number(e.target.value),
                            };
                            return { ...s, plantilla };
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                      />
                    </label>
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      Posición (pos)
                      <input
                        list={`rival-pos-${index}`}
                        placeholder="Portero, Defensa central…"
                        value={player.pos}
                        onChange={(e) =>
                          setDraft((s) => {
                            if (!s) return s;
                            const plantilla = [...s.plantilla];
                            plantilla[index] = { ...plantilla[index]!, pos: e.target.value };
                            return { ...s, plantilla };
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                      />
                      <datalist id={`rival-pos-${index}`}>
                        {RIVAL_SQUAD_POS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} />
                        ))}
                      </datalist>
                    </label>
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      Edad
                      <input
                        placeholder="Edad"
                        type="number"
                        value={player.edad ?? ""}
                        onChange={(e) =>
                          setDraft((s) => {
                            if (!s) return s;
                            const plantilla = [...s.plantilla];
                            plantilla[index] = {
                              ...plantilla[index]!,
                              edad: e.target.value === "" ? null : Number(e.target.value),
                            };
                            return { ...s, plantilla };
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                      />
                    </label>
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      Pie
                      <select
                        value={player.pie ?? "Derecho"}
                        onChange={(e) =>
                          setDraft((s) => {
                            if (!s) return s;
                            const plantilla = [...s.plantilla];
                            plantilla[index] = {
                              ...plantilla[index]!,
                              pie: e.target.value as RivalSquadImportPlayer["pie"],
                            };
                            return { ...s, plantilla };
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                      >
                        {RIVAL_SQUAD_FOOT_OPTIONS.map((foot) => (
                          <option key={foot} value={foot}>
                            {foot}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      Altura
                      <input
                        placeholder="1,85 m"
                        value={player.altura ?? ""}
                        onChange={(e) =>
                          setDraft((s) => {
                            if (!s) return s;
                            const plantilla = [...s.plantilla];
                            plantilla[index] = {
                              ...plantilla[index]!,
                              altura: e.target.value.trim() ? e.target.value : null,
                            };
                            return { ...s, plantilla };
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                      />
                    </label>
                    <input
                      placeholder="Valor mercado"
                      value={player.valor ?? ""}
                      onChange={(e) =>
                        setDraft((s) => {
                          if (!s) return s;
                          const plantilla = [...s.plantilla];
                          plantilla[index] = {
                            ...plantilla[index]!,
                            valor: e.target.value.trim() ? e.target.value : null,
                          };
                          return { ...s, plantilla };
                        })
                      }
                      className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    />
                    {STAT_FIELDS.map(({ key, label }) => (
                      <input
                        key={key}
                        placeholder={label}
                        type="number"
                        min={0}
                        value={player[key]}
                        onChange={(e) =>
                          setDraft((s) => {
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
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="w-full rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
        >
          {busy ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Guardando…
            </span>
          ) : (
            "Guardar plantilla de esta temporada"
          )}
        </button>
        {message ? <p className="text-xs font-semibold text-slate-600">{message}</p> : null}
      </div>
    </OnPageEditorSection>
  );
}
