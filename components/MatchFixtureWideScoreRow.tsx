import { OpponentCrest } from "@/components/OpponentCrest";
import { MatchTeamLink } from "@/components/TeamLink";
import { getTeamByGender } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

type MatchFixtureWideScoreRowProps = {
  match: Match;
  gender?: PrimerEquipoGender;
  highlightTeamId: string;
  scoreLabel: string;
  sublabel?: string;
  linkTeams?: boolean;
  homeTeamClassName?: string;
  awayTeamClassName?: string;
  scoreStripeClassName?: string;
  crestOnGranateBackground?: boolean;
  className?: string;
};

function teamCrestLogo(teamId: string, gender: PrimerEquipoGender): string {
  const team = getTeamByGender(teamId, gender);
  return getTeamCrestById(teamId, team?.crestInitials);
}

function teamTextClassName(highlighted: boolean, align: "left" | "right", className?: string) {
  return cn(
    "block w-full min-w-0 truncate text-[11px] font-extrabold leading-snug sm:text-sm",
    align === "right" ? "text-right" : "text-left",
    highlighted ? "text-[#214C9B]" : "text-slate-800",
    className,
  );
}

export function MatchFixtureWideScoreRow({
  match,
  gender = "masculino",
  highlightTeamId,
  scoreLabel,
  sublabel,
  linkTeams = true,
  homeTeamClassName,
  awayTeamClassName,
  scoreStripeClassName,
  crestOnGranateBackground = false,
  className,
}: MatchFixtureWideScoreRowProps) {
  const homeHighlighted = match.homeTeamId === highlightTeamId;
  const awayHighlighted = match.awayTeamId === highlightTeamId;
  const homeClassName = teamTextClassName(homeHighlighted, "left", homeTeamClassName);
  const awayClassName = teamTextClassName(awayHighlighted, "right", awayTeamClassName);

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_minmax(8.75rem,10.5rem)_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(10.5rem,12rem)_minmax(0,1fr)] sm:gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 py-2 pl-2 pr-1 sm:pl-3">
        <div className="pointer-events-auto min-w-0 flex-1">
          {linkTeams ? (
            <MatchTeamLink
              gender={gender}
              teamId={match.homeTeamId}
              teamName={match.homeTeam}
              highlighted={homeHighlighted}
              className={homeClassName}
            />
          ) : (
            <span className={homeClassName}>{match.homeTeam}</span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-14 w-full items-center justify-between gap-2 self-stretch rounded-xl bg-[#214C9B] px-2.5 py-2 text-center text-white shadow-md shadow-blue-950/10 sm:min-h-16 sm:rounded-2xl sm:px-3",
          scoreStripeClassName,
        )}
      >
        <OpponentCrest
          logo={teamCrestLogo(match.homeTeamId, gender)}
          opponent={match.homeTeam}
          teamId={match.homeTeamId}
          onGranateBackground={crestOnGranateBackground}
          size="sm"
          className="shrink-0"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-extrabold leading-none tabular-nums sm:text-2xl">{scoreLabel}</span>
          {sublabel ? (
            <span className="mt-1 block w-full break-words text-[9px] font-bold uppercase leading-snug text-white/85 sm:text-[10px]">
              {sublabel}
            </span>
          ) : null}
        </span>
        <OpponentCrest
          logo={teamCrestLogo(match.awayTeamId, gender)}
          opponent={match.awayTeam}
          teamId={match.awayTeamId}
          onGranateBackground={crestOnGranateBackground}
          size="sm"
          className="shrink-0"
        />
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 py-2 pl-1 pr-2 text-right sm:pr-3">
        <div className="pointer-events-auto min-w-0 flex-1">
          {linkTeams ? (
            <MatchTeamLink
              gender={gender}
              teamId={match.awayTeamId}
              teamName={match.awayTeam}
              highlighted={awayHighlighted}
              align="right"
              className={awayClassName}
            />
          ) : (
            <span className={awayClassName}>{match.awayTeam}</span>
          )}
        </div>
      </div>
    </div>
  );
}
