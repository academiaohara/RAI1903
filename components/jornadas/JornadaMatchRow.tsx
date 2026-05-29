import { TeamCrest } from "@/components/TeamCrest";
import { TeamLink } from "@/components/TeamLink";
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
}: JornadaMatchRowProps) {
  const home = getJornadaTeam(fixture.homeTeamId);
  const away = getJornadaTeam(fixture.awayTeamId);
  const highlightHome = Boolean(highlightTeamId && fixture.homeTeamId === highlightTeamId);
  const highlightAway = Boolean(highlightTeamId && fixture.awayTeamId === highlightTeamId);

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
        {home ? (
          <TeamLink gender={gender} teamId={fixture.homeTeamId} teamName={fixture.homeTeamName} className="shrink-0">
            <TeamCrest team={home} size="sm" className="shrink-0" />
          </TeamLink>
        ) : null}
        <TeamLink gender={gender} teamId={fixture.homeTeamId} teamName={fixture.homeTeamName} className={nameClass(highlightHome)}>
          {fixture.homeTeamName}
        </TeamLink>
      </div>

      <div
        className={cn(
          "min-w-[4.5rem] rounded-xl px-3 py-2 text-center text-sm font-extrabold tabular-nums",
          highlighted ? "bg-[#981915] text-white shadow-sm" : "bg-[#214C9B] text-white",
        )}
      >
        {scoreOrTime(fixture)}
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        <TeamLink
          gender={gender}
          teamId={fixture.awayTeamId}
          teamName={fixture.awayTeamName}
          className={cn(nameClass(highlightAway), "text-right")}
        >
          {fixture.awayTeamName}
        </TeamLink>
        {away ? (
          <TeamLink gender={gender} teamId={fixture.awayTeamId} teamName={fixture.awayTeamName} className="shrink-0">
            <TeamCrest team={away} size="sm" className="shrink-0" />
          </TeamLink>
        ) : null}
      </div>
    </article>
  );
}
