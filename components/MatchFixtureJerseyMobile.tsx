import { OpponentCrest } from "@/components/OpponentCrest";
import { getTeamByGender } from "@/lib/fixtures";
import { matchFixtureCardMobileWidthClassName } from "@/lib/match-card-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

type MatchFixtureJerseyMobileProps = {
  match: Match;
  gender?: PrimerEquipoGender;
  scoreLabel: string;
  roundLabel?: string | null;
  dateLabel?: string;
  venueLabel?: string;
  centerClassName?: string;
  className?: string;
};

function teamCrestLogo(teamId: string, gender: PrimerEquipoGender, teamName?: string): string {
  const team = getTeamByGender(teamId, gender);
  const initials = team?.crestInitials ?? (teamName ? teamName.replace(/\s+U19$/i, "").slice(0, 3).toUpperCase() : undefined);
  return getTeamCrestById(teamId, initials);
}

export function MatchFixtureJerseyMobile({
  match,
  gender = "masculino",
  scoreLabel,
  roundLabel,
  dateLabel,
  venueLabel,
  centerClassName,
  className,
}: MatchFixtureJerseyMobileProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 items-stretch overflow-hidden rounded-xl",
        matchFixtureCardMobileWidthClassName,
        className,
      )}
    >
      <div className="flex items-center justify-center bg-white p-2.5">
        <OpponentCrest
          logo={teamCrestLogo(match.homeTeamId, gender, match.homeTeam)}
          opponent={match.homeTeam}
          size="md"
          className="mx-auto"
        />
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-col items-center justify-center bg-[#214C9B] px-1.5 py-3 text-center text-white",
          centerClassName,
        )}
      >
        {roundLabel ? (
          <p className="w-full break-words text-[10px] font-extrabold uppercase leading-tight tracking-normal text-white/90">
            {roundLabel}
          </p>
        ) : null}
        <p
          className={cn(
            "font-extrabold leading-none tabular-nums text-white",
            roundLabel ? "mt-0.5 text-2xl" : "text-3xl",
          )}
        >
          {scoreLabel}
        </p>
        {dateLabel ? (
          <p className="mt-1 w-full break-words text-[9px] font-bold uppercase leading-snug tracking-normal text-white/85">
            {dateLabel}
          </p>
        ) : null}
        {venueLabel ? (
          <p className="mt-0.5 w-full break-words text-[9px] font-bold leading-snug text-white/90">{venueLabel}</p>
        ) : null}
      </div>
      <div className="flex items-center justify-center bg-white p-2.5">
        <OpponentCrest
          logo={teamCrestLogo(match.awayTeamId, gender, match.awayTeam)}
          opponent={match.awayTeam}
          size="md"
          className="mx-auto"
        />
      </div>
    </div>
  );
}
