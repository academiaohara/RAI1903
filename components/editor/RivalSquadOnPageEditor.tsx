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
import { buildDefaultRivalSquadImport } from "@/lib/rival-squad-defaults";
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

function emptyPlayer(dorsal: number): RivalSquadImportPlayer {
  return {
    dorsal,
    jugador: "",
    pos: "Centrocampista",
    edad: null,
    pj: 0,
    g: 0,
    a: 0,
    ta: 0,
    tr: 0,
    valor: null,
    contrato: null,
  };
}

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

  useEffect(() => {
    queueMicrotask(() => {
      setDraft(stored?.plantilla?.length ? structuredClone(stored) : buildDefaultRivalSquadImport(team));
      setMessage(null);
    });
  }, [stored, team]);

  const squadDraft = draft ?? buildDefaultRivalSquadImport(team);

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
    setMessage("Borrador restaurado (guarda para aplicar en Supabase)");
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
                        plantilla: [...s.plantilla, emptyPlayer(s.plantilla.length + 1)],
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
                  className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                />
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
                        dorsal: e.target.value === "" ? 0 : Number(e.target.value),
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
                    setDraft((s) => {
                      if (!s) return s;
                      const plantilla = [...s.plantilla];
                      plantilla[index] = { ...plantilla[index]!, pos: e.target.value };
                      return { ...s, plantilla };
                    })
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                />
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
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                />
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
