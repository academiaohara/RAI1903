"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { useSeason } from "@/components/season/SeasonProvider";
import { upsertSeasonBundle } from "@/lib/cms/season-bundles";
import { getSquadBundle } from "@/lib/cms/season-bundles";
import { seasonSquadBundlePayload } from "@/lib/season/squad-source";
import { createEmptySquadPlayer } from "@/lib/squad-defaults";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadPlayer, SquadPosition } from "@/types/squad";
import { SQUAD_POSITIONS, SQUAD_POSITION_LABELS } from "@/types/squad";
import type { PlayerStatus } from "@/types";

const ESTADOS: PlayerStatus[] = ["titular", "suplente", "lesionado", "sancionado", "cantera", "nuevo fichaje"];

type SquadEditorPanelProps = {
  onClose: () => void;
};

export function SquadEditorPanel({ onClose }: SquadEditorPanelProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [gender, setGender] = useState<PrimerEquipoGender>("masculino");
  const [players, setPlayers] = useState<SquadPlayer[] | null>(null);
  const [coach, setCoach] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const bundlePlayers = useMemo(() => getSquadBundle(bundles, gender)?.players ?? [], [bundles, gender]);
  const bundleCoach = useMemo(() => getSquadBundle(bundles, gender)?.clubInfo?.entrenador ?? "", [bundles, gender]);

  useEffect(() => {
    queueMicrotask(() => {
      setPlayers(bundlePlayers.length ? [...bundlePlayers] : []);
      setCoach(bundleCoach);
    });
  }, [bundleCoach, bundlePlayers, gender]);

  const list = useMemo(() => players ?? [], [players]);

  const updatePlayer = (id: string, patch: Partial<SquadPlayer>) => {
    setPlayers((current) => (current ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePlayer = (id: string) => {
    setPlayers((current) => (current ?? []).filter((p) => p.id !== id));
  };

  const addPlayer = (posicion: SquadPosition) => {
    setPlayers((current) => [...(current ?? []), createEmptySquadPlayer(posicion)]);
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const payload = seasonSquadBundlePayload(list, { entrenador: coach.trim() });
    const result = await upsertSeasonBundle(viewedSeasonId, gender, "squad", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar plantilla");
      return;
    }
    setMessage(`Plantilla ${gender} guardada (${viewedSeason.label})`);
    await refreshBundles();
  };

  const byPosition = useCallback(() => {
    const map = Object.fromEntries(SQUAD_POSITIONS.map((p) => [p, [] as SquadPlayer[]])) as Record<
      SquadPosition,
      SquadPlayer[]
    >;
    for (const p of list) map[p.posicion].push(p);
    return map;
  }, [list]);

  const grouped = byPosition();

  return (
    <EditorPanelFrame
      title="Plantilla"
      subtitle={viewedSeason.label}
      onClose={onClose}
      busy={busy}
      message={message}
      footer={
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="w-full rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
        >
          Guardar plantilla
        </button>
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

      <label className="mb-4 block text-xs font-bold uppercase text-slate-500">
        Entrenador
        <input
          value={coach}
          onChange={(e) => setCoach(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#214C9B]/20 px-3 py-2 text-sm font-semibold normal-case text-slate-800"
        />
      </label>

      {SQUAD_POSITIONS.map((position) => (
        <section key={position} className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase text-[#214C9B]">{SQUAD_POSITION_LABELS[position]}</h3>
            <button
              type="button"
              onClick={() => addPlayer(position)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#214C9B]/20 px-2 py-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              <Plus size={12} /> Añadir
            </button>
          </div>
          <ul className="space-y-2">
            {grouped[position].length === 0 ? (
              <li className="text-xs font-semibold text-slate-400">Sin jugadores</li>
            ) : (
              grouped[position].map((player) => (
                <li key={player.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-2">
                  <div className="flex gap-2">
                    <input
                      value={player.nombre}
                      onChange={(e) => updatePlayer(player.id, { nombre: e.target.value })}
                      placeholder="Nombre"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                    />
                    <input
                      value={player.apellido}
                      onChange={(e) => updatePlayer(player.id, { apellido: e.target.value })}
                      placeholder="Apellido"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                    />
                    <input
                      type="number"
                      value={player.dorsal}
                      onChange={(e) => updatePlayer(player.id, { dorsal: Number(e.target.value) || 0 })}
                      className="w-12 rounded-lg border border-slate-200 px-1 py-1 text-center text-xs font-bold"
                      aria-label="Dorsal"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={player.estado}
                      onChange={(e) => updatePlayer(player.id, { estado: e.target.value as PlayerStatus })}
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase"
                    >
                      {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      className="rounded-lg border border-red-200 p-1.5 text-[#981915] hover:bg-red-50"
                      aria-label={`Eliminar ${getPlayerFullName(player)}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      ))}
    </EditorPanelFrame>
  );
}
