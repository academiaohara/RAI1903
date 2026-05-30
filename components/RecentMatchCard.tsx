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
import { cn, formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";
import type { Route } from "next";
import { RAI_TEAM_ID } from "@/data/mock";

type RecentMatchCardProps = {
  match: Match;
  gender?: PrimerEquipoGender;
};

const nestedLinkClass =
  "underline decoration-[#981915]/30 underline-offset-2 transition hover:decoration-[#981915] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]";

export function RecentMatchCard({ match, gender = "masculino" }: RecentMatchCardProps) {
  const result = getAvilesMatchResult(match);
  const cronica = getCronicaForMatch(match.id, gender);
  const cronicaHref = (cronica ? `${primerEquipoBase(gender)}/cronicas/${cronica.id}` : `${primerEquipoBase(gender)}/cronicas`) as Route;
  const competicionHref = `${primerEquipoBase(gender)}/competicion` as Route;
  const scoreLabel = `${match.homeScore} - ${match.awayScore}`;
  const competitionLabel = matchCompetitionShortLabel(match);

  return (
    <article className={cn(matchFixtureCardClassName, "group relative hover:-translate-y-0.5")}>
      <Link
        href={cronicaHref}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]"
        aria-label={`Crónica: ${match.homeTeam} ${scoreLabel} ${match.awayTeam}`}
      />
      <div className="relative z-[1] pointer-events-none">
        <div className="mb-1 flex items-center justify-between gap-2">
          <Badge tone={result === "W" ? "green" : result === "D" ? "amber" : result === "L" ? "red" : "slate"}>
            {result === "W" ? "Victoria" : result === "D" ? "Empate" : result === "L" ? "Derrota" : "Finalizado"}
          </Badge>
          <Link
            href={competicionHref}
            className={cn(
              "pointer-events-auto relative z-10 inline-flex max-w-[58%] shrink-0 items-center justify-end gap-1.5 text-right text-[11px] font-bold uppercase leading-none tracking-[0.06em] text-[#981915]",
              nestedLinkClass,
            )}
            aria-label={`Ver competición: ${competitionLabel}`}
          >
            <CompetitionLogo competition={match.competition} alt="" size="xs" />
            <span>{matchFixtureMeta(match)}</span>
          </Link>
        </div>
        <div className="pointer-events-auto relative z-10">
          <MatchFixtureTeamLinks
            match={match}
            gender={gender}
            highlightTeamId={RAI_TEAM_ID}
            scoreLabel={scoreLabel}
          />
        </div>
        <p className="mt-2 text-xs font-bold text-slate-600">
          {formatMatchDate(match.date)} · Leer la cronica
        </p>
      </div>
    </article>
  );
}
