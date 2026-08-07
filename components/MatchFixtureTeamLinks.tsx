import { MatchFixtureScorePill } from "@/components/MatchFixtureScorePill";
import { MatchTeamLink } from "@/components/TeamLink";
import { getTeamByGender } from "@/lib/fixtures";
import { getTeamCrestById } from "@/lib/team-crests";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

type MatchFixtureTeamLinksProps = {
  match: Match;
  gender?: PrimerEquipoGender;
  highlightTeamId: string;
  scoreLabel: string;
  homeTeamLinkClassName?: string;
  awayTeamLinkClassName?: string;
  scorePillClassName?: string;
  showCrests?: boolean;
};

export function MatchFixtureTeamLinks({
  match,
  gender = "masculino",
  highlightTeamId,
  scoreLabel,
  homeTeamLinkClassName,
  awayTeamLinkClassName,
  scorePillClassName,
  showCrests: showCrestsProp,
}: MatchFixtureTeamLinksProps) {
  const showCrests = showCrestsProp ?? true;
  const avilesHome = match.homeTeamId === highlightTeamId;
  const avilesAway = match.awayTeamId === highlightTeamId;

  const homeTeam = getTeamByGender(match.homeTeamId, gender);
  const awayTeam = getTeamByGender(match.awayTeamId, gender);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:gap-2">
      <div className="pointer-events-auto relative z-10 flex min-w-0 justify-start">
        <MatchTeamLink
          gender={gender}
          teamId={match.homeTeamId}
          teamName={match.homeTeam}
          highlighted={avilesHome}
          className={cn("max-w-full", homeTeamLinkClassName)}
        />
      </div>
      <MatchFixtureScorePill
        homeLogo={getTeamCrestById(match.homeTeamId, homeTeam?.crestInitials)}
        homeTeam={match.homeTeam}
        awayLogo={getTeamCrestById(match.awayTeamId, awayTeam?.crestInitials)}
        awayTeam={match.awayTeam}
        label={scoreLabel}
        showCrests={showCrests}
        className={cn("pointer-events-none relative z-0", scorePillClassName)}
      />
      <div className="pointer-events-auto relative z-10 flex min-w-0 justify-end">
        <MatchTeamLink
          gender={gender}
          teamId={match.awayTeamId}
          teamName={match.awayTeam}
          highlighted={avilesAway}
          align="right"
          className={cn("max-w-full", awayTeamLinkClassName)}
        />
      </div>
    </div>
  );
}
