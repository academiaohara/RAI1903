import { OpponentCrest } from "@/components/OpponentCrest";
import { MatchTeamLink } from "@/components/TeamLink";
import { getTeamByGender } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";
import type { ReactNode } from "react";

type MatchFixtureDesktopPanelsProps = {
  match: Match;
  gender?: PrimerEquipoGender;
  highlightTeamId: string;
  scoreLabel: string;
  dateLabel?: string;
  badge: ReactNode;
  competitionSlot: ReactNode;
  footerLeft?: ReactNode;
  homeTeamClassName?: string;
  awayTeamClassName?: string;
  scoreStripeClassName?: string;
};

function teamCrestLogo(teamId: string, gender: PrimerEquipoGender): string {
  const team = getTeamByGender(teamId, gender);
  return getTeamCrestById(teamId, team?.crestInitials);
}

function teamTextClassName(highlighted: boolean, align: "left" | "right", className?: string) {
  return cn(
    "block w-full min-w-0 text-sm font-extrabold leading-snug sm:text-base",
    align === "right" ? "text-right" : "text-left",
    highlighted ? "text-[#214C9B]" : "text-slate-800",
    className,
  );
}

export function MatchFixtureDesktopPanels({
  match,
  gender = "masculino",
  highlightTeamId,
  scoreLabel,
  dateLabel,
  badge,
  competitionSlot,
  footerLeft,
  homeTeamClassName,
  awayTeamClassName,
  scoreStripeClassName,
}: MatchFixtureDesktopPanelsProps) {
  const homeHighlighted = match.homeTeamId === highlightTeamId;
  const awayHighlighted = match.awayTeamId === highlightTeamId;
  const homeClassName = teamTextClassName(homeHighlighted, "left", homeTeamClassName);
  const awayClassName = teamTextClassName(awayHighlighted, "right", awayTeamClassName);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(10.5rem,12rem)_minmax(0,1fr)] items-stretch">
      <div className="flex min-w-0 flex-col justify-between gap-2 py-3 pl-3 pr-2">
        <div>{badge}</div>
        <div className="pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col justify-center py-1">
          <MatchTeamLink
            gender={gender}
            teamId={match.homeTeamId}
            teamName={match.homeTeam}
            highlighted={homeHighlighted}
            className={homeClassName}
          />
        </div>
        {footerLeft ? <div className="pointer-events-auto">{footerLeft}</div> : null}
      </div>

      <div
        className={cn(
          "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 self-stretch bg-[#214C9B] px-2.5 py-2.5 text-center text-white shadow-md shadow-blue-950/10",
          scoreStripeClassName,
        )}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <OpponentCrest
            logo={teamCrestLogo(match.homeTeamId, gender)}
            opponent={match.homeTeam}
            size="sm"
            className="shrink-0"
          />
          <span className="min-w-0 flex-1 text-2xl font-extrabold leading-none tabular-nums">{scoreLabel}</span>
          <OpponentCrest
            logo={teamCrestLogo(match.awayTeamId, gender)}
            opponent={match.awayTeam}
            size="sm"
            className="shrink-0"
          />
        </div>
        {dateLabel ? (
          <p className="w-full break-words text-[10px] font-bold uppercase leading-snug tracking-normal text-white/85">
            {dateLabel}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-2 py-3 pl-2 pr-3 text-right">
        <div className="flex justify-end">{competitionSlot}</div>
        <div className="pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col justify-center py-1">
          <MatchTeamLink
            gender={gender}
            teamId={match.awayTeamId}
            teamName={match.awayTeam}
            highlighted={awayHighlighted}
            align="right"
            className={awayClassName}
          />
        </div>
      </div>
    </div>
  );
}
