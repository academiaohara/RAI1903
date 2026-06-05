"use client";

import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { MatchFixtureDesktopPanels } from "@/components/MatchFixtureDesktopPanels";
import { MatchFixtureJerseyMobile } from "@/components/MatchFixtureJerseyMobile";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { matchCompetitionShortLabel, matchFixtureMeta, matchRoundBadgeLabel } from "@/lib/competition-labels";
import { matchFixtureCardClassName, matchFixtureDesktopCardMinHeightClassName } from "@/lib/match-card-styles";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { getMatchArticlePageHref } from "@/lib/match-article-url";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { primerEquipoBase } from "@/lib/primer-equipo";
import { cn, formatMatchTime, formatMatchWeekdayLetterDate } from "@/lib/utils";
import type { Match } from "@/types";
import type { Route } from "next";

type UpcomingMatchCardProps = {
  match: Match;
  gender?: PrimerEquipoGender;
};

const secondaryLinkHoverClass = cn(
  "underline decoration-transparent underline-offset-[3px] transition-[color,text-decoration-color,transform] duration-150",
  "hover:!text-[#981915] hover:!decoration-[#981915]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]",
);

const teamLinkHoverClass = cn(
  secondaryLinkHoverClass,
  "group-has-[a.upcoming-card-overlay:hover]/card:!text-white",
  "group-has-[a.upcoming-card-overlay:hover]/card:decoration-transparent",
  "group-has-[a.upcoming-card-overlay:hover]/card:hover:!text-[#981915]",
  "group-has-[a.upcoming-card-overlay:hover]/card:hover:!decoration-[#981915]",
);

const upcomingCardHoverClass = cn(
  "has-[a.upcoming-card-overlay:hover]:-translate-y-0.5",
  "has-[a.upcoming-card-overlay:hover]:border-[#214C9B]",
  "has-[a.upcoming-card-overlay:hover]:bg-[#214C9B]",
  "has-[a.upcoming-card-overlay:hover]:shadow-[0_10px_24px_rgba(33,76,155,0.22)]",
  "has-[a.upcoming-card-overlay:hover]:[&_.upcoming-card-competicion]:!text-white",
  "has-[a.upcoming-card-overlay:hover]:[&_.upcoming-card-competicion]:decoration-transparent",
  "has-[a.upcoming-card-overlay:hover]:[&_.upcoming-card-competicion_img]:brightness-0",
  "has-[a.upcoming-card-overlay:hover]:[&_.upcoming-card-competicion_img]:invert",
);

const upcomingFooterHoverClass = cn(
  "text-xs font-bold text-slate-600 transition-colors duration-200",
  "group-has-[a.upcoming-card-overlay:hover]/card:!text-white",
);

export function UpcomingMatchCard({ match, gender = "masculino" }: UpcomingMatchCardProps) {
  const { getForMatch } = useSeasonMatchArticles();
  const article = getForMatch(match.id, gender);
  const matchHref =
    getMatchArticlePageHref(match.id, gender, article?.id ?? defaultCronicaId(match.id, gender)) ??
    (`${primerEquipoBase(gender)}/calendario` as Route);
  const competicionHref = `${primerEquipoBase(gender)}/competicion` as Route;
  const timeLabel = formatMatchTime(match.date);
  const dateLabel = formatMatchWeekdayLetterDate(match.date);
  const competitionLabel = matchCompetitionShortLabel(match);
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
  const roundLabel = matchRoundBadgeLabel(match) ?? matchCompetitionShortLabel(match);

  const badge = (
    <Badge
      tone="blue"
      className={cn(
        "transition-colors duration-200",
        "group-has-[a.upcoming-card-overlay:hover]/card:border-white/35 group-has-[a.upcoming-card-overlay:hover]/card:bg-white/20 group-has-[a.upcoming-card-overlay:hover]/card:text-white",
      )}
    >
      Programado
    </Badge>
  );

  const competitionLink = (
    <Link
      href={competicionHref}
      className={cn(
        "upcoming-card-competicion pointer-events-auto relative z-10 inline-flex max-w-full shrink-0 items-center justify-end gap-1.5 text-right text-[11px] font-bold uppercase leading-none tracking-[0.06em] text-[#981915] transition-colors duration-200",
        secondaryLinkHoverClass,
        "hover:translate-x-0.5",
      )}
      aria-label={`Ver competición: ${competitionLabel}`}
    >
      <CompetitionLogo competition={match.competition} alt="" size="xs" />
      <span>{matchFixtureMeta(match)}</span>
    </Link>
  );

  return (
    <article
      className={cn(
        matchFixtureCardClassName,
        "group/card relative p-0 transition-[transform,background-color,border-color,box-shadow] duration-200",
        matchFixtureDesktopCardMinHeightClassName,
        upcomingCardHoverClass,
      )}
    >
      <Link
        href={matchHref}
        className="upcoming-card-overlay absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B] md:rounded-2xl"
        aria-label={`Previa: ${match.homeTeam} - ${match.awayTeam}, ${timeLabel}`}
      />
      <div className="relative z-[1] pointer-events-none">
        <div className="md:hidden">
          <MatchFixtureJerseyMobile
            match={match}
            gender={gender}
            scoreLabel={timeLabel}
            roundLabel={roundLabel}
            dateLabel={dateLabel}
            venueLabel={match.venue}
            centerClassName={cn(
              "transition-colors duration-200",
              "group-has-[a.upcoming-card-overlay:hover]/card:bg-white group-has-[a.upcoming-card-overlay:hover]/card:text-[#214C9B]",
              "group-has-[a.upcoming-card-overlay:hover]/card:[&_p]:text-[#214C9B]/80",
            )}
          />
        </div>
        <div className="relative z-[1] hidden md:block">
          <MatchFixtureDesktopPanels
            match={match}
            gender={gender}
            highlightTeamId={highlightTeamId}
            scoreLabel={timeLabel}
            dateLabel={dateLabel}
            badge={badge}
            competitionSlot={competitionLink}
            footerLeft={
              match.venue ? <p className={upcomingFooterHoverClass}>{match.venue}</p> : null
            }
            homeTeamClassName={cn(teamLinkHoverClass, "hover:translate-x-0.5")}
            awayTeamClassName={cn(teamLinkHoverClass, "hover:-translate-x-0.5")}
            scoreStripeClassName={cn(
              "transition-colors duration-200",
              "group-has-[a.upcoming-card-overlay:hover]/card:bg-white group-has-[a.upcoming-card-overlay:hover]/card:text-[#214C9B]",
              "group-has-[a.upcoming-card-overlay:hover]/card:shadow-white/20",
              "group-has-[a.upcoming-card-overlay:hover]/card:[&_p]:text-[#214C9B]/80",
            )}
          />
        </div>
      </div>
    </article>
  );
}
