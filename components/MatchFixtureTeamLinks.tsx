import { MatchFixtureScorePill } from "@/components/MatchFixtureScorePill";
import { MatchTeamLink } from "@/components/TeamLink";
import { getTeam } from "@/lib/fixtures";
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
  const showCrests = showCrestsProp ?? gender !== "femenino";
  const avilesHome = match.homeTeamId === highlightTeamId;
  const avilesAway = match.awayTeamId === highlightTeamId;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:gap-2">
      <div className="pointer-events-auto relative z-10 min-w-0">
        <MatchTeamLink
          gender={gender}
          teamId={match.homeTeamId}
          teamName={match.homeTeam}
          highlighted={avilesHome}
          className={homeTeamLinkClassName}
        />
      </div>
      <MatchFixtureScorePill
        homeLogo={getTeamCrestById(match.homeTeamId, getTeam(match.homeTeamId)?.crestInitials)}
        homeTeam={match.homeTeam}
        awayLogo={getTeamCrestById(match.awayTeamId, getTeam(match.awayTeamId)?.crestInitials)}
        awayTeam={match.awayTeam}
        label={scoreLabel}
        showCrests={showCrests}
        className={cn("pointer-events-none relative z-0", scorePillClassName)}
      />
      <div className="pointer-events-auto relative z-10 min-w-0">
        <MatchTeamLink
          gender={gender}
          teamId={match.awayTeamId}
          teamName={match.awayTeam}
          highlighted={avilesAway}
          align="right"
          className={awayTeamLinkClassName}
        />
      </div>
    </div>
  );
}
