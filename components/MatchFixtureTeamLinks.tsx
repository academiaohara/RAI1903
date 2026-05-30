import { MatchFixtureScorePill } from "@/components/MatchFixtureScorePill";
import { MatchTeamLink } from "@/components/TeamLink";
import { getTeam } from "@/lib/fixtures";
import { getTeamCrestById } from "@/lib/team-crests";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";

type MatchFixtureTeamLinksProps = {
  match: Match;
  gender?: PrimerEquipoGender;
  highlightTeamId: string;
  scoreLabel: string;
  homeTeamLinkClassName?: string;
  awayTeamLinkClassName?: string;
  scorePillClassName?: string;
};

export function MatchFixtureTeamLinks({
  match,
  gender = "masculino",
  highlightTeamId,
  scoreLabel,
  homeTeamLinkClassName,
  awayTeamLinkClassName,
  scorePillClassName,
}: MatchFixtureTeamLinksProps) {
  const avilesHome = match.homeTeamId === highlightTeamId;
  const avilesAway = match.awayTeamId === highlightTeamId;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <MatchTeamLink
        gender={gender}
        teamId={match.homeTeamId}
        teamName={match.homeTeam}
        highlighted={avilesHome}
        className={homeTeamLinkClassName}
      />
      <MatchFixtureScorePill
        homeLogo={getTeamCrestById(match.homeTeamId, getTeam(match.homeTeamId)?.crestInitials)}
        homeTeam={match.homeTeam}
        awayLogo={getTeamCrestById(match.awayTeamId, getTeam(match.awayTeamId)?.crestInitials)}
        awayTeam={match.awayTeam}
        label={scoreLabel}
        className={scorePillClassName}
      />
      <MatchTeamLink
        gender={gender}
        teamId={match.awayTeamId}
        teamName={match.awayTeam}
        highlighted={avilesAway}
        align="right"
        className={awayTeamLinkClassName}
      />
    </div>
  );
}
