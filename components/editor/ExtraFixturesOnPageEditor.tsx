"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OnPageEditorSection } from "@/components/editor/OnPageEditorSection";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  emptyAmistosoMatch,
  emptyCopaMatch,
  mergeExtraFixturesIntoBundle,
} from "@/lib/cms/extra-fixtures";
import { getFixturesBundle, upsertSeasonBundle, type SeasonFixturesBundle } from "@/lib/cms/season-bundles";
import { slugFromTeamName } from "@/lib/cms/group-teams";
import { RAI_TEAM_ID } from "@/data/mock";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { Match } from "@/types";

function matchDateInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function matchTimeInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "12:00";
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function mergeMatchDateTime(iso: string, dateValue: string, timeValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
}

function ExtraMatchEditor({
  match,
  onChange,
  onDelete,
  showStage,
}: {
  match: Match;
  onChange: (next: Match) => void;
  onDelete: () => void;
  showStage?: boolean;
}) {
  const isRaiHome = match.homeTeamId === RAI_TEAM_ID;
  const rivalName = isRaiHome ? match.awayTeam : match.homeTeam;
  const rivalId = isRaiHome ? match.awayTeamId : match.homeTeamId;

  const setRival = (name: string) => {
    const id = slugFromTeamName(name) || rivalId;
    if (isRaiHome) {
      onChange({ ...match, awayTeamId: id, awayTeam: name });
    } else {
      onChange({ ...match, homeTeamId: id, homeTeam: name });
    }
  };

  const setAvilesHome = (avilesHome: boolean) => {
    if (avilesHome) {
      onChange({
        ...match,
        homeTeamId: RAI_TEAM_ID,
        homeTeam: "Real Avilés Industrial",
        awayTeamId: rivalId,
        awayTeam: rivalName,
      });
    } else {
      onChange({
        ...match,
        awayTeamId: RAI_TEAM_ID,
        awayTeam: "Real Avilés Industrial",
        homeTeamId: rivalId,
        homeTeam: rivalName,
      });
    }
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase text-slate-500">{match.id}</p>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg border border-[#981915]/25 px-2 py-1 text-[10px] font-bold uppercase text-[#981915] hover:bg-red-50"
        >
          <Trash2 size={12} aria-hidden />
          Eliminar
        </button>
      </div>

      <label className="block text-xs font-semibold text-slate-600">
        Rival
        <input
          value={rivalName}
          onChange={(e) => setRival(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={isRaiHome}
          onChange={(e) => setAvilesHome(e.target.checked)}
          className="rounded border-slate-300"
        />
        Real Avilés juega de local
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold text-slate-600">
          Fecha
          <input
            type="date"
            value={matchDateInput(match.date)}
            onChange={(e) =>
              onChange({
                ...match,
                date: mergeMatchDateTime(match.date, e.target.value, matchTimeInput(match.date)),
              })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Hora (UTC)
          <input
            type="time"
            value={matchTimeInput(match.date)}
            onChange={(e) =>
              onChange({
                ...match,
                date: mergeMatchDateTime(match.date, matchDateInput(match.date), e.target.value),
              })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {showStage ? (
        <label className="block text-xs font-semibold text-slate-600">
          Fase / ronda
          <input
            value={match.competitionStage ?? ""}
            onChange={(e) => onChange({ ...match, competitionStage: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Primera eliminatoria"
          />
        </label>
      ) : null}

      <label className="block text-xs font-semibold text-slate-600">
        Estado
        <select
          value={match.status}
          onChange={(e) => onChange({ ...match, status: e.target.value as Match["status"] })}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="scheduled">Programado</option>
          <option value="finished">Finalizado</option>
        </select>
      </label>

      {match.status === "finished" ? (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">
            Goles local
            <input
              type="number"
              min={0}
              value={match.homeScore ?? 0}
              onChange={(e) => onChange({ ...match, homeScore: Number(e.target.value) })}
              className="mt-1 block w-16 rounded-xl border border-slate-200 px-2 py-2 text-sm text-center"
            />
          </label>
          <span className="pt-6 font-bold text-slate-400">-</span>
          <label className="text-xs font-semibold text-slate-600">
            Goles visitante
            <input
              type="number"
              min={0}
              value={match.awayScore ?? 0}
              onChange={(e) => onChange({ ...match, awayScore: Number(e.target.value) })}
              className="mt-1 block w-16 rounded-xl border border-slate-200 px-2 py-2 text-sm text-center"
            />
          </label>
        </div>
      ) : null}

      <label className="block text-xs font-semibold text-slate-600">
        Campo
        <input
          value={match.venue ?? ""}
          onChange={(e) => onChange({ ...match, venue: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
    </div>
  );
}

export function ExtraFixturesOnPageEditor() {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [amistosos, setAmistosos] = useState<Match[]>([]);
  const [copa, setCopa] = useState<Match[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadFromBundles = useCallback(() => {
    const source = fixtureSourceFromBundles(bundles, "masculino");
    setAmistosos(structuredClone(source.amistosoMatches));
    setCopa(structuredClone(source.copaDelReyMatches));
  }, [bundles]);

  useEffect(() => {
    queueMicrotask(() => loadFromBundles());
  }, [loadFromBundles]);

  const existingBundle = useMemo(
    () => getFixturesBundle(bundles, "masculino") as SeasonFixturesBundle | null,
    [bundles],
  );

  const saveExtraFixtures = async () => {
    if (!existingBundle?.matchdays?.length) {
      setMessage("Primero genera el calendario de liga en Editar → Competición.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const payload = mergeExtraFixturesIntoBundle(
      existingBundle,
      existingBundle.matchdays,
      existingBundle.matchdaysGrupo2,
      amistosos,
      copa,
    );
    const result = await upsertSeasonBundle(viewedSeasonId, "masculino", "fixtures", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar");
      return;
    }
    setMessage(`Pretemporada y Copa guardadas (${viewedSeason.label})`);
    await refreshBundles();
  };

  return (
    <OnPageEditorSection
      title="Pretemporada y Copa del Rey"
      description="Añade, edita o elimina amistosos y partidos de copa. Los cambios se guardan en el calendario de la temporada (no solo en edición en línea)."
    >
      <div className="space-y-4">
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold uppercase text-[#214C9B]">Pretemporada (amistosos)</h3>
            <button
              type="button"
              onClick={() => setAmistosos((rows) => [...rows, emptyAmistosoMatch()])}
              className="inline-flex items-center gap-1 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-[10px] font-bold uppercase text-[#214C9B]"
            >
              <Plus size={12} aria-hidden />
              Añadir amistoso
            </button>
          </div>
          {amistosos.length === 0 ? (
            <p className="text-xs font-bold text-slate-500">Sin amistosos en esta temporada.</p>
          ) : (
            amistosos.map((match, index) => (
              <ExtraMatchEditor
                key={match.id}
                match={match}
                onChange={(next) =>
                  setAmistosos((rows) => rows.map((row, i) => (i === index ? next : row)))
                }
                onDelete={() => setAmistosos((rows) => rows.filter((_, i) => i !== index))}
              />
            ))
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold uppercase text-[#214C9B]">Copa del Rey</h3>
            <button
              type="button"
              onClick={() => setCopa((rows) => [...rows, emptyCopaMatch()])}
              className="inline-flex items-center gap-1 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-[10px] font-bold uppercase text-[#214C9B]"
            >
              <Plus size={12} aria-hidden />
              Añadir partido de copa
            </button>
          </div>
          {copa.length === 0 ? (
            <p className="text-xs font-bold text-slate-500">Sin partidos de copa en esta temporada.</p>
          ) : (
            copa.map((match, index) => (
              <ExtraMatchEditor
                key={match.id}
                match={match}
                showStage
                onChange={(next) => setCopa((rows) => rows.map((row, i) => (i === index ? next : row)))}
                onDelete={() => setCopa((rows) => rows.filter((_, i) => i !== index))}
              />
            ))
          )}
        </section>

        {message ? (
          <p
            className={`text-xs font-bold ${message.startsWith("Error") || message.includes("Primero") ? "text-[#981915]" : "text-emerald-700"}`}
          >
            {message}
          </p>
        ) : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => void saveExtraFixtures()}
          className="w-full rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
        >
          {busy ? "Guardando…" : "Guardar pretemporada y copa en Supabase"}
        </button>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Para partidos de liga (jornadas), usa el modo edición en Jornadas o Calendario y pulsa «Guardar en Supabase» para
          los ajustes en línea. Aquí los cambios de copa y amistosos se escriben directamente en el bundle de calendario.
        </p>
      </div>
    </OnPageEditorSection>
  );
}
