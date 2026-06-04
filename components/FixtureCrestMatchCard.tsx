"use client";

import Link from "next/link";
import { MatchFixtureJerseyMobile } from "@/components/MatchFixtureJerseyMobile";
import { MatchFixtureWideScoreRow } from "@/components/MatchFixtureWideScoreRow";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { matchRoundBadgeLabel } from "@/lib/competition-labels";
import { fixtureCrestMatchCardClassName, matchFixtureCardMobileWidthClassName } from "@/lib/match-card-styles";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { getMatchArticlePageHref } from "@/lib/match-article-url";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { primerEquipoBase } from "@/lib/primer-equipo";
import { cn, formatMatchDate, formatMatchDay, formatMatchTime } from "@/lib/utils";
import type { Match } from "@/types";
import type { Route } from "next";

export type FixtureCrestMatchAccent = "blue" | "granate";

type FixtureCrestMatchCardProps = {
  match: Match;
  accent: FixtureCrestMatchAccent;
  gender?: PrimerEquipoGender;
  href?: Route;
  /** Si false, muestra la tarjeta sin enlace (p. ej. cantera). */
  linkable?: boolean;
};

export function FixtureCrestMatchCard({
  match,
  accent,
  gender = "masculino",
  href,
  linkable = true,
}: FixtureCrestMatchCardProps) {
  const { getForMatch } = useSeasonMatchArticles();
  const article = getForMatch(match.id, gender);
  const defaultHref =
    getMatchArticlePageHref(match.id, gender, article?.id ?? defaultCronicaId(match.id, gender)) ??
    (`${primerEquipoBase(gender)}/calendario` as Route);
  const linkHref = href ?? defaultHref;
  const scoreLabel = match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : formatMatchTime(match.date);
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
  const dateLabel = match.status === "scheduled" ? formatMatchDay(match.date) : formatMatchDate(match.date);
  const roundLabel = matchRoundBadgeLabel(match);
  const centerAccent = accent === "granate" ? "bg-[#981915]" : "bg-[#214C9B]";
  const cardClassName = cn(
    fixtureCrestMatchCardClassName,
    accent === "granate" && "hover:border-[#981915]/70",
  );

  const inner = (
    <>
      <div className="md:hidden">
        <MatchFixtureJerseyMobile
          match={match}
          gender={gender}
          scoreLabel={scoreLabel}
          roundLabel={roundLabel}
          dateLabel={dateLabel}
          centerClassName={centerAccent}
          className={matchFixtureCardMobileWidthClassName}
        />
      </div>
      <MatchFixtureWideScoreRow
        match={match}
        gender={gender}
        highlightTeamId={highlightTeamId}
        scoreLabel={scoreLabel}
        sublabel={dateLabel}
        linkTeams={false}
        className="hidden gap-0 md:grid md:gap-0"
        scoreStripeClassName={cn("rounded-none shadow-none", centerAccent)}
        homeTeamClassName="text-[10px] md:text-xs"
        awayTeamClassName="text-[10px] md:text-xs"
      />
    </>
  );

  if (!linkable) {
    return <div className={cardClassName}>{inner}</div>;
  }

  return (
    <Link
      href={linkHref}
      className={cardClassName}
      aria-label={`${match.homeTeam} ${scoreLabel} ${match.awayTeam}`}
    >
      {inner}
    </Link>
  );
}
