"use client";

import { TeamCrest } from "@/components/TeamCrest";
import { TeamLink } from "@/components/TeamLink";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { getJornadaTeam } from "@/lib/jornadas-data";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { formatMatchDate } from "@/lib/utils";
import type { JornadaFixture } from "@/types/jornadas";
import { cn } from "@/lib/utils";

type JornadaMatchRowProps = {
  fixture: JornadaFixture;
  highlighted?: boolean;
  highlightTeamId?: string;
  gender?: PrimerEquipoGender;
  showCrests?: boolean;
};

function scoreOrTime(fixture: JornadaFixture): string {
  if (fixture.status === "finished" && fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
    return `${fixture.homeScore} - ${fixture.awayScore}`;
  }
  if (fixture.kickoffTime) return fixture.kickoffTime;
  return formatMatchDate(fixture.date).split(",").pop()?.trim() ?? "—";
}

export function JornadaMatchRow({
  fixture,
  highlighted = false,
  highlightTeamId,
  gender = "masculino",
  showCrests: showCrestsProp,
}: JornadaMatchRowProps) {
  const { editMode, getOverride, saveValue } = useInlineEditing();
  const override = getOverride<Partial<JornadaFixture>>(`match-result:${fixture.id}`) ?? {};
  const editedFixture = { ...fixture, ...override };
  const showCrests = showCrestsProp ?? gender !== "femenino";
  const home = getJornadaTeam(editedFixture.homeTeamId);
  const away = getJornadaTeam(editedFixture.awayTeamId);
  const highlightHome = Boolean(highlightTeamId && editedFixture.homeTeamId === highlightTeamId);
  const highlightAway = Boolean(highlightTeamId && editedFixture.awayTeamId === highlightTeamId);
  const savePatch = (patch: Partial<JornadaFixture>) => {
    saveValue(`match-result:${fixture.id}`, { ...override, ...patch });
  };

  const nameClass = (isHighlight: boolean) =>
    cn(
      "min-w-0 truncate text-sm font-extrabold",
      isHighlight ? (highlighted ? "text-[#981915]" : "text-[#214C9B]") : "text-slate-800",
    );

  return (
    <article
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-2xl border p-3 sm:gap-3 sm:p-4",
        highlighted
          ? "border-[#981915]/40 bg-gradient-to-br from-[#981915]/6 via-white to-[#214C9B]/5 shadow-[0_10px_28px_rgba(152,25,21,0.12)]"
          : "border-[#214C9B]/12 bg-slate-50/80",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {home && showCrests ? (
          <TeamLink gender={gender} teamId={editedFixture.homeTeamId} teamName={editedFixture.homeTeamName} className="shrink-0">
            <TeamCrest team={home} size="sm" className="shrink-0" />
          </TeamLink>
        ) : null}
        <TeamLink gender={gender} teamId={editedFixture.homeTeamId} teamName={editedFixture.homeTeamName} className={nameClass(highlightHome)}>
          {editedFixture.homeTeamName}
        </TeamLink>
      </div>

      {editMode ? (
        <div className="min-w-[7rem] rounded-xl border border-[#214C9B]/20 bg-white p-2 text-center shadow-sm">
          <select
            value={editedFixture.status}
            onChange={(event) => savePatch({ status: event.target.value as JornadaFixture["status"] })}
            className="mb-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
            aria-label="Editar estado del partido"
          >
            <option value="scheduled">Programado</option>
            <option value="finished">Finalizado</option>
          </select>
          {editedFixture.status === "finished" ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editedFixture.homeScore ?? 0}
                onChange={(event) => savePatch({ homeScore: Number(event.target.value) })}
                className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-extrabold text-[#214C9B]"
                aria-label="Goles local"
              />
              <span className="text-xs font-extrabold text-slate-400">-</span>
              <input
                type="number"
                value={editedFixture.awayScore ?? 0}
                onChange={(event) => savePatch({ awayScore: Number(event.target.value) })}
                className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-extrabold text-[#214C9B]"
                aria-label="Goles visitante"
              />
            </div>
          ) : (
            <input
              type="time"
              value={editedFixture.kickoffTime ?? ""}
              onChange={(event) => savePatch({ kickoffTime: event.target.value })}
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-extrabold text-[#214C9B]"
              aria-label="Hora del partido"
            />
          )}
        </div>
      ) : (
        <div
          className={cn(
            "min-w-[4.5rem] rounded-xl px-3 py-2 text-center text-sm font-extrabold tabular-nums",
            highlighted ? "bg-[#981915] text-white shadow-sm" : "bg-[#214C9B] text-white",
          )}
        >
          {scoreOrTime(editedFixture)}
        </div>
      )}

      <div className="flex min-w-0 items-center justify-end gap-2">
        <TeamLink
          gender={gender}
          teamId={editedFixture.awayTeamId}
          teamName={editedFixture.awayTeamName}
          className={cn(nameClass(highlightAway), "text-right")}
        >
          {editedFixture.awayTeamName}
        </TeamLink>
        {away && showCrests ? (
          <TeamLink gender={gender} teamId={editedFixture.awayTeamId} teamName={editedFixture.awayTeamName} className="shrink-0">
            <TeamCrest team={away} size="sm" className="shrink-0" />
          </TeamLink>
        ) : null}
      </div>
    </article>
  );
}
