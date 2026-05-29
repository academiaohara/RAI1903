import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { MatchFixtureTeamLinks } from "@/components/MatchFixtureTeamLinks";
import { matchCompetitionShortLabel, matchFixtureMeta } from "@/lib/competition-labels";
import { getCronicaForMatch } from "@/lib/match-articles";
import { getAvilesMatchResult } from "@/lib/fixtures";
import { matchFixtureCardClassName } from "@/lib/match-card-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { primerEquipoBase } from "@/lib/primer-equipo";
import { formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";
import type { Route } from "next";
import { RAI_TEAM_ID } from "@/data/mock";

type RecentMatchCardProps = {
  match: Match;
  gender?: PrimerEquipoGender;
};

export function RecentMatchCard({ match, gender = "masculino" }: RecentMatchCardProps) {
  const result = getAvilesMatchResult(match);
  const cronica = getCronicaForMatch(match.id, gender);
  const href = (cronica ? `${primerEquipoBase(gender)}/cronicas/${cronica.id}` : `${primerEquipoBase(gender)}/cronicas`) as Route;
  const scoreLabel = `${match.homeScore} - ${match.awayScore}`;

  return (
    <article className={matchFixtureCardClassName}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <Badge tone={result === "W" ? "green" : result === "D" ? "amber" : result === "L" ? "red" : "slate"}>
          {result === "W" ? "Victoria" : result === "D" ? "Empate" : result === "L" ? "Derrota" : "Finalizado"}
        </Badge>
        <span className="flex shrink-0 items-center justify-end gap-1.5 text-right text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[#981915]">
          <CompetitionLogo competition={match.competition} alt={matchCompetitionShortLabel(match)} size="xs" />
          {matchFixtureMeta(match)}
        </span>
      </div>
      <MatchFixtureTeamLinks
        match={match}
        gender={gender}
        highlightTeamId={RAI_TEAM_ID}
        scoreLabel={scoreLabel}
      />
      <p className="mt-2 text-xs font-bold text-slate-600">
        {formatMatchDate(match.date)} ·{" "}
        <Link href={href} className="text-[#214C9B] underline decoration-[#214C9B]/30 underline-offset-2 hover:decoration-[#214C9B]">
          Leer la cronica
        </Link>
      </p>
    </article>
  );
}
