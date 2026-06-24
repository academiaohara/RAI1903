"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { TeamColorPairInput } from "@/components/editor/TeamColorPairInput";
import { useSeason } from "@/components/season/SeasonProvider";
import { upsertSeasonBundle } from "@/lib/cms/season-bundles";
import { getTeamsBundle, type CmsTeamRecord, type SeasonTeamsBundle } from "@/lib/cms/teams-bundle";
import { collectTeamsFromBundles } from "@/lib/season/teams-from-fixtures";
import { resolveTeamColorsFromSources } from "@/lib/team-stripes";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

type TeamsEditorPanelProps = {
  onClose: () => void;
};

function slugId(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function TeamsEditorPanel({ onClose }: TeamsEditorPanelProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [gender, setGender] = useState<PrimerEquipoGender>("masculino");
  const [teams, setTeams] = useState<CmsTeamRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const fixtureTeams = useMemo(() => collectTeamsFromBundles(bundles), [bundles]);
  const bundleTeams = useMemo(() => getTeamsBundle(bundles, gender)?.teams ?? [], [bundles, gender]);

  const merged = useMemo(() => {
    const map = new Map<string, CmsTeamRecord>();
    for (const ref of fixtureTeams) {
      map.set(ref.id, { id: ref.id, name: ref.name });
    }
    for (const t of bundleTeams) {
      map.set(t.id, { ...map.get(t.id), ...t });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [bundleTeams, fixtureTeams]);

  useEffect(() => {
    queueMicrotask(() => setTeams(merged.map((t) => ({ ...t }))));
  }, [merged, gender]);

  const list = teams ?? [];
  const filtered = filter.trim()
    ? list.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()) || t.id.includes(filter))
    : list;

  const updateTeam = (id: string, patch: Partial<CmsTeamRecord>) => {
    setTeams((current) => (current ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const addTeam = () => {
    const id = `equipo-${Date.now()}`;
    setTeams((current) => [
      ...(current ?? []),
      {
        id,
        name: "Nuevo equipo",
        shortName: "NEQ",
        coach: "",
        stadium: "",
        colors: [...resolveTeamColorsFromSources(id)],
        removed: false,
      },
    ]);
  };

  const removeFromList = (id: string) => {
    updateTeam(id, { removed: true, name: "" });
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const payload: SeasonTeamsBundle = { teams: list };
    const result = await upsertSeasonBundle(viewedSeasonId, gender, "teams", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar equipos");
      return;
    }
    setMessage(`Equipos guardados (${viewedSeason.label})`);
    await refreshBundles();
  };

  return (
    <EditorPanelFrame
      title="Equipos"
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
          Guardar equipos
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

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Buscar equipo…"
        className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
      />

      <button
        type="button"
        onClick={addTeam}
        className="mb-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#214C9B]/40 py-2 text-xs font-extrabold uppercase text-[#214C9B]"
      >
        <Plus size={14} /> Añadir equipo
      </button>

      <ul className="space-y-3">
        {filtered.map((team, index) => (
          <li
            key={team.id}
            className={`rounded-xl border p-2 ${team.removed ? "border-slate-200 bg-slate-100 opacity-70" : "border-slate-200 bg-white"}`}
          >
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">{team.id}</p>
            {team.removed ? (
              <p className="text-sm font-bold text-slate-500">
                Eliminado → se mostrará como Equipo {index + 1}
              </p>
            ) : (
              <>
                <input
                  value={team.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    updateTeam(team.id, { name, shortName: name.slice(0, 12) });
                  }}
                  className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm font-bold"
                  placeholder="Nombre"
                />
                <div className="grid gap-1">
                  <input
                    value={team.coach ?? ""}
                    onChange={(e) => updateTeam(team.id, { coach: e.target.value })}
                    placeholder="Entrenador"
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                  />
                  <input
                    value={team.stadium ?? ""}
                    onChange={(e) => updateTeam(team.id, { stadium: e.target.value })}
                    placeholder="Estadio"
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                  />
                  <input
                    value={team.crestInitials ?? ""}
                    onChange={(e) => updateTeam(team.id, { crestInitials: e.target.value.toUpperCase().slice(0, 3) })}
                    placeholder="Iniciales escudo"
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                  />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Colores (franjas guía)</p>
                    <TeamColorPairInput
                      fieldId={`teams-editor-${team.id}`}
                      colors={resolveTeamColorsFromSources(team.id, team.colors)}
                      onChange={(colors) => updateTeam(team.id, { colors: [...colors] })}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="mt-2 flex gap-2">
              {!team.removed ? (
                <button
                  type="button"
                  onClick={() => removeFromList(team.id)}
                  className="text-[10px] font-bold uppercase text-[#981915]"
                >
                  Marcar eliminado
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateTeam(team.id, { removed: false })}
                  className="text-[10px] font-bold uppercase text-[#214C9B]"
                >
                  Restaurar
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setTeams((current) => (current ?? []).filter((t) => t.id !== team.id))
                }
                className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-slate-400"
              >
                <Trash2 size={12} /> Quitar fila
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] font-semibold text-slate-400">
        Tip: al guardar un equipo nuevo usa un id único ({slugId("ejemplo")}).
      </p>
    </EditorPanelFrame>
  );
}
