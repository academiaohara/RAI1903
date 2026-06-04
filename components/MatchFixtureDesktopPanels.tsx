import { OpponentCrest } from "@/components/OpponentCrest";
import { MatchTeamLink } from "@/components/TeamLink";
import { matchFixtureDesktopGridClassName } from "@/lib/match-card-styles";
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
    <div className={cn(matchFixtureDesktopGridClassName, "h-full min-h-[7.5rem]")}>
      <div className="flex min-h-0 min-w-0 flex-col justify-between gap-2 px-3 py-3">
        <div>{badge}</div>
        <div className="pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col justify-center">
          <MatchTeamLink
            gender={gender}
            teamId={match.homeTeamId}
            teamName={match.homeTeam}
            highlighted={homeHighlighted}
            className={homeClassName}
          />
        </div>
        <div className="pointer-events-auto min-h-[1.125rem]">{footerLeft ?? <span className="sr-only"> </span>}</div>
      </div>

      <div
        className={cn(
          "flex h-full min-h-0 flex-col items-center justify-center gap-1 self-stretch bg-[#214C9B] px-2.5 py-2 text-center text-white",
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

      <div className="flex min-h-0 min-w-0 flex-col justify-between gap-2 px-3 py-3 text-right">
        <div className="flex justify-end">{competitionSlot}</div>
        <div className="pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col justify-center">
          <MatchTeamLink
            gender={gender}
            teamId={match.awayTeamId}
            teamName={match.awayTeam}
            highlighted={awayHighlighted}
            align="right"
            className={awayClassName}
          />
        </div>
        <div className="min-h-[1.125rem]" aria-hidden />
      </div>
    </div>
  );
}
