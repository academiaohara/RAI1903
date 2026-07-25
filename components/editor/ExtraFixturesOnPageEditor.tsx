"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OnPageEditorSection } from "@/components/editor/OnPageEditorSection";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  emptyAmistosoMatch,
  emptyCalendarExtraMatch,
  emptyCopaMatch,
  extraFixtureCompetitionOptions,
  mergeExtraFixturesIntoBundle,
  mergeFemeninoExtraFixturesIntoBundle,
} from "@/lib/cms/extra-fixtures";
import {
  getFixturesBundle,
  upsertSeasonBundle,
  type SeasonFemeninoFixturesBundle,
  type SeasonFixturesBundle,
} from "@/lib/cms/season-bundles";
import { slugFromTeamName } from "@/lib/cms/group-teams";
import { getRaiTeamId } from "@/lib/fixtures";
import { applyMatchInlineOverride } from "@/lib/fixture-overrides";
import { matchResultOverrideKey } from "@/lib/fixture-inline-keys";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { DEFAULT_KICKOFF_UTC, extractKickoffTimeUtc, isUnsetKickoffUtc } from "@/lib/match-kickoff-time";
import type { CompetitionId, Match } from "@/types";

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
  if (Number.isNaN(date.getTime()) || isUnsetKickoffUtc(iso)) return "";
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function mergeMatchDateTime(iso: string, dateValue: string, timeValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!dateValue || Number.isNaN(year)) return iso;
  const resolvedTime = timeValue || extractKickoffTimeUtc(iso) || DEFAULT_KICKOFF_UTC;
  const [hours, minutes] = resolvedTime.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
}

function ExtraMatchEditor({
  match,
  onChange,
  onDelete,
  defaultCompetitionName,
  gender,
}: {
  match: Match;
  onChange: (next: Match) => void;
  onDelete: () => void;
  defaultCompetitionName: string;
  gender: PrimerEquipoGender;
}) {
  const raiTeamId = getRaiTeamId(gender);
  const isRaiHome = match.homeTeamId === raiTeamId;
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

  const avilesName = gender === "femenino" ? "Real Avilés Industrial Femenino" : "Real Avilés Industrial";

  const setAvilesHome = (avilesHome: boolean) => {
    if (avilesHome) {
      onChange({
        ...match,
        homeTeamId: raiTeamId,
        homeTeam: avilesName,
        awayTeamId: rivalId,
        awayTeam: rivalName,
      });
    } else {
      onChange({
        ...match,
        awayTeamId: raiTeamId,
        awayTeam: avilesName,
        homeTeamId: rivalId,
        homeTeam: rivalName,
      });
    }
  };

  const competitionName = match.competitionStage?.trim() || defaultCompetitionName;

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

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-slate-600">
          Tipo de competición
          <select
            value={match.competition}
            onChange={(e) => onChange({ ...match, competition: e.target.value as CompetitionId })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {extraFixtureCompetitionOptions(gender).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Nombre de la competición
          <input
            value={competitionName}
            onChange={(e) => onChange({ ...match, competitionStage: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={defaultCompetitionName}
          />
        </label>
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

type ExtraSectionProps = {
  title: string;
  emptyLabel: string;
  addLabel: string;
  defaultCompetitionName: string;
  matches: Match[];
  onChange: (rows: Match[]) => void;
  onAdd: () => void;
};

function ExtraMatchSection({
  title,
  emptyLabel,
  addLabel,
  defaultCompetitionName,
  matches,
  onChange,
  onAdd,
  gender,
}: ExtraSectionProps & { gender: PrimerEquipoGender }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold uppercase text-[#214C9B]">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-[10px] font-bold uppercase text-[#214C9B]"
        >
          <Plus size={12} aria-hidden />
          {addLabel}
        </button>
      </div>
      {matches.length === 0 ? (
        <p className="text-xs font-bold text-slate-500">{emptyLabel}</p>
      ) : (
        matches.map((match, index) => (
          <ExtraMatchEditor
            key={match.id}
            match={match}
            gender={gender}
            defaultCompetitionName={defaultCompetitionName}
            onChange={(next) => onChange(matches.map((row, i) => (i === index ? next : row)))}
            onDelete={() => onChange(matches.filter((_, i) => i !== index))}
          />
        ))
      )}
    </section>
  );
}

type ExtraFixturesOnPageEditorProps = {
  gender?: PrimerEquipoGender;
};

export function ExtraFixturesOnPageEditor({ gender = "masculino" }: ExtraFixturesOnPageEditorProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const { getOverride, clearValue } = useInlineEditing();
  const [amistosos, setAmistosos] = useState<Match[]>([]);
  const [copa, setCopa] = useState<Match[]>([]);
  const [extras, setExtras] = useState<Match[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const isFemenino = gender === "femenino";

  const applyOverridesToMatches = useCallback(
    (matches: Match[]) =>
      matches.map((match) => applyMatchInlineOverride(match, getOverride, gender)),
    [getOverride, gender],
  );

  const loadFromBundles = useCallback(() => {
    const source = fixtureSourceFromBundles(bundles, gender);
    setAmistosos(structuredClone(applyOverridesToMatches(source.amistosoMatches)));
    setCopa(structuredClone(applyOverridesToMatches(source.copaDelReyMatches)));
    setExtras(structuredClone(applyOverridesToMatches(source.calendarExtraMatches)));
    setDirty(false);
  }, [applyOverridesToMatches, bundles, gender]);

  useEffect(() => {
    if (dirty) return;
    queueMicrotask(() => loadFromBundles());
  }, [dirty, loadFromBundles]);

  const existingMasculinoBundle = useMemo(
    () => getFixturesBundle(bundles, "masculino") as SeasonFixturesBundle | null,
    [bundles],
  );
  const existingFemeninoBundle = useMemo(
    () => getFixturesBundle(bundles, "femenino") as SeasonFemeninoFixturesBundle | null,
    [bundles],
  );

  const clearSavedMatchOverrides = (matchIds: string[]) => {
    for (const matchId of new Set(matchIds)) {
      clearValue(matchResultOverrideKey(gender, matchId));
    }
  };

  const saveExtraFixtures = async () => {
    if (isFemenino) {
      if (!existingFemeninoBundle?.matchdaysFemenino?.length) {
        setMessage("Primero genera el calendario de liga en Editar → Competición (femenino).");
        return;
      }
      const previousIds = [
        ...(existingFemeninoBundle.amistosoMatches ?? []).map((match) => match.id),
        ...(existingFemeninoBundle.calendarExtraMatches ?? []).map((match) => match.id),
      ];
      setBusy(true);
      setMessage(null);
      const payload = mergeFemeninoExtraFixturesIntoBundle(
        existingFemeninoBundle,
        existingFemeninoBundle.matchdaysFemenino,
        amistosos,
        extras,
      );
      const result = await upsertSeasonBundle(viewedSeasonId, "femenino", "fixtures", payload);
      setBusy(false);
      if (!result.ok) {
        setMessage(result.error ?? "Error al guardar");
        return;
      }
      clearSavedMatchOverrides([
        ...previousIds,
        ...amistosos.map((match) => match.id),
        ...extras.map((match) => match.id),
      ]);
      const total = amistosos.length + extras.length;
      setMessage(`Partidos extra guardados (${total} en ${viewedSeason.label})`);
      setDirty(false);
      await refreshBundles();
      return;
    }

    if (!existingMasculinoBundle?.matchdays?.length) {
      setMessage("Primero genera el calendario de liga en Editar → Competición.");
      return;
    }
    const previousIds = [
      ...(existingMasculinoBundle.amistosoMatches ?? []).map((match) => match.id),
      ...(existingMasculinoBundle.copaDelReyMatches ?? []).map((match) => match.id),
      ...(existingMasculinoBundle.calendarExtraMatches ?? []).map((match) => match.id),
    ];
    setBusy(true);
    setMessage(null);
    const payload = mergeExtraFixturesIntoBundle(
      existingMasculinoBundle,
      existingMasculinoBundle.matchdays,
      existingMasculinoBundle.matchdaysGrupo2,
      amistosos,
      copa,
      extras,
    );
    const result = await upsertSeasonBundle(viewedSeasonId, "masculino", "fixtures", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Error al guardar");
      return;
    }
    clearSavedMatchOverrides([
      ...previousIds,
      ...amistosos.map((match) => match.id),
      ...copa.map((match) => match.id),
      ...extras.map((match) => match.id),
    ]);
    const total = amistosos.length + copa.length + extras.length;
    setMessage(`Partidos extra guardados (${total} en ${viewedSeason.label})`);
    setDirty(false);
    await refreshBundles();
  };

  return (
    <OnPageEditorSection
      title="Partidos extra del calendario"
      description={
        isFemenino
          ? "Añade amistosos, torneos u otros partidos del equipo femenino. El nombre de competición es el que verán en el calendario."
          : "Añade amistosos, copa, playoff, playout u otros partidos del Avilés. El nombre de competición es el que verán los aficionados en el calendario."
      }
    >
      <div className="space-y-4">
        <ExtraMatchSection
          title="Pretemporada (amistosos)"
          emptyLabel="Sin amistosos en esta temporada."
          addLabel="Añadir amistoso"
          defaultCompetitionName="Pretemporada"
          matches={amistosos}
          onChange={(rows) => {
            setDirty(true);
            setAmistosos(rows);
          }}
          onAdd={() => {
            setDirty(true);
            setAmistosos((rows) => [...rows, emptyAmistosoMatch("Rival", gender)]);
          }}
          gender={gender}
        />

        {!isFemenino ? (
          <ExtraMatchSection
            title="Copa del Rey"
            emptyLabel="Sin partidos de copa en esta temporada."
            addLabel="Añadir partido de copa"
            defaultCompetitionName="Copa del Rey"
            matches={copa}
            onChange={(rows) => {
              setDirty(true);
              setCopa(rows);
            }}
            onAdd={() => {
              setDirty(true);
              setCopa((rows) => [...rows, emptyCopaMatch("Rival", "Eliminatoria", gender)]);
            }}
            gender={gender}
          />
        ) : null}

        <ExtraMatchSection
          title={isFemenino ? "Otros partidos del equipo" : "Otros partidos del Avilés"}
          emptyLabel="Sin otros partidos extra (playoff, torneos, etc.)."
          addLabel="Añadir partido"
          defaultCompetitionName="Torneo / fase extra"
          matches={extras}
          onChange={(rows) => {
            setDirty(true);
            setExtras(rows);
          }}
          onAdd={() => {
            setDirty(true);
            setExtras((rows) => [...rows, emptyCalendarExtraMatch("Rival", "Torneo / fase extra", gender)]);
          }}
          gender={gender}
        />

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
          {busy ? "Guardando…" : "Guardar partidos extra en Supabase"}
        </button>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Para partidos de liga (jornadas), usa el modo edición en Jornadas o Calendario y pulsa «Guardar en Supabase» para
          los ajustes en línea. Los partidos de este panel se escriben directamente en el bundle de calendario.
        </p>
      </div>
    </OnPageEditorSection>
  );
}
