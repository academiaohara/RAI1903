import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { MatchFixtureTeamLinks } from "@/components/MatchFixtureTeamLinks";
import { matchCompetitionShortLabel, matchFixtureMeta } from "@/lib/competition-labels";
import { getCronicaForMatch } from "@/lib/match-articles";
import { getAvilesMatchResult } from "@/lib/fixtures";
import { matchFixtureCardClassName } from "@/lib/match-card-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { primerEquipoBase, primerEquipoHasCronicas } from "@/lib/primer-equipo";
import { cn, formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";
import type { Route } from "next";
import { RAI_TEAM_ID } from "@/data/mock";

type RecentMatchCardProps = {
  match: Match;
  gender?: PrimerEquipoGender;
};

/** Hover de enlaces secundarios (equipo / competición): granate + subrayado + desplazamiento. */
const secondaryLinkHoverClass = cn(
  "underline decoration-transparent underline-offset-[3px] transition-[color,text-decoration-color,transform] duration-150",
  "hover:!text-[#981915] hover:!decoration-[#981915]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]",
);

const teamLinkHoverClass = cn(
  secondaryLinkHoverClass,
  "group-has-[a.cronica-overlay:hover]/card:!text-white",
  "group-has-[a.cronica-overlay:hover]/card:decoration-transparent",
  "group-has-[a.cronica-overlay:hover]/card:hover:!text-[#981915]",
  "group-has-[a.cronica-overlay:hover]/card:hover:!decoration-[#981915]",
);

const cronicaCardHoverClass = cn(
  "has-[a.cronica-overlay:hover]:-translate-y-0.5",
  "has-[a.cronica-overlay:hover]:border-[#214C9B]",
  "has-[a.cronica-overlay:hover]:bg-[#214C9B]",
  "has-[a.cronica-overlay:hover]:shadow-[0_10px_24px_rgba(33,76,155,0.22)]",
  "has-[a.cronica-overlay:hover]:[&_.recent-card-competicion]:!text-white",
  "has-[a.cronica-overlay:hover]:[&_.recent-card-competicion]:decoration-transparent",
  "has-[a.cronica-overlay:hover]:[&_.recent-card-competicion_img]:brightness-0",
  "has-[a.cronica-overlay:hover]:[&_.recent-card-competicion_img]:invert",
);

const cronicaContentHoverClass = "group-has-[a.cronica-overlay:hover]/card:text-white";

export function RecentMatchCard({ match, gender = "masculino" }: RecentMatchCardProps) {
  const result = getAvilesMatchResult(match);
  const cronica = getCronicaForMatch(match.id, gender);
  const hasCronicas = primerEquipoHasCronicas(gender);
  const cronicaHref = (
    hasCronicas
      ? cronica
        ? `${primerEquipoBase(gender)}/cronicas/${cronica.id}`
        : `${primerEquipoBase(gender)}/cronicas`
      : `${primerEquipoBase(gender)}/calendario`
  ) as Route;
  const competicionHref = `${primerEquipoBase(gender)}/competicion` as Route;
  const scoreLabel = `${match.homeScore} - ${match.awayScore}`;
  const competitionLabel = matchCompetitionShortLabel(match);

  return (
    <article
      className={cn(
        matchFixtureCardClassName,
        "group/card relative overflow-hidden transition-[transform,background-color,border-color,box-shadow] duration-200",
        cronicaCardHoverClass,
      )}
    >
      <Link
        href={cronicaHref}
        className="cronica-overlay absolute inset-0 z-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]"
        aria-label={
          hasCronicas
            ? `Crónica: ${match.homeTeam} ${scoreLabel} ${match.awayTeam}`
            : `Calendario: ${match.homeTeam} ${scoreLabel} ${match.awayTeam}`
        }
      />
      <div className="relative z-[1] pointer-events-none">
        <div className="mb-1 flex items-center justify-between gap-2">
          <Badge
            tone={result === "W" ? "green" : result === "D" ? "amber" : result === "L" ? "red" : "slate"}
            className={cn(
              "transition-colors duration-200",
              "group-has-[a.cronica-overlay:hover]/card:border-white/35 group-has-[a.cronica-overlay:hover]/card:bg-white/20 group-has-[a.cronica-overlay:hover]/card:text-white",
            )}
          >
            {result === "W" ? "Victoria" : result === "D" ? "Empate" : result === "L" ? "Derrota" : "Finalizado"}
          </Badge>
          <Link
            href={competicionHref}
            className={cn(
              "recent-card-competicion pointer-events-auto relative z-10 inline-flex max-w-[58%] shrink-0 items-center justify-end gap-1.5 text-right text-[11px] font-bold uppercase leading-none tracking-[0.06em] text-[#981915] transition-colors duration-200",
              secondaryLinkHoverClass,
              "hover:translate-x-0.5",
            )}
            aria-label={`Ver competición: ${competitionLabel}`}
          >
            <CompetitionLogo competition={match.competition} alt="" size="xs" />
            <span>{matchFixtureMeta(match)}</span>
          </Link>
        </div>
        <div className="relative z-[1]">
          <MatchFixtureTeamLinks
            match={match}
            gender={gender}
            highlightTeamId={RAI_TEAM_ID}
            scoreLabel={scoreLabel}
            homeTeamLinkClassName={cn(teamLinkHoverClass, "hover:translate-x-0.5")}
            awayTeamLinkClassName={cn(teamLinkHoverClass, "hover:-translate-x-0.5")}
            scorePillClassName={cn(
              "transition-colors duration-200",
              "group-has-[a.cronica-overlay:hover]/card:border group-has-[a.cronica-overlay:hover]/card:border-white/40",
              "group-has-[a.cronica-overlay:hover]/card:bg-white group-has-[a.cronica-overlay:hover]/card:text-[#214C9B]",
              "group-has-[a.cronica-overlay:hover]/card:shadow-white/20",
            )}
          />
        </div>
        <p className={cn("mt-2 text-xs font-bold text-slate-600 transition-colors duration-200", cronicaContentHoverClass, "group-has-[a.cronica-overlay:hover]/card:!text-white")}>
          {formatMatchDate(match.date)}
          {hasCronicas ? " · Leer la cronica" : ""}
        </p>
      </div>
    </article>
  );
}
