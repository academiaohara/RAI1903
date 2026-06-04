"use client";

import Link from "next/link";
import { MatchFixtureWideScoreRow } from "@/components/MatchFixtureWideScoreRow";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { fixtureCrestMatchCardClassName } from "@/lib/match-card-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { primerEquipoBase, primerEquipoHasCronicas } from "@/lib/primer-equipo";
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
  const hasCronicas = primerEquipoHasCronicas(gender);
  const defaultHref = (
    hasCronicas
      ? `${primerEquipoBase(gender)}/cronicas/${article?.id ?? defaultCronicaId(match.id, gender)}`
      : `${primerEquipoBase(gender)}/calendario`
  ) as Route;
  const linkHref = href ?? defaultHref;
  const scoreLabel = match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : formatMatchTime(match.date);
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
  const timeOrDate =
    match.status === "scheduled"
      ? formatMatchDay(match.date)
      : formatMatchDate(match.date);
  const cardClassName = cn(
    fixtureCrestMatchCardClassName,
    accent === "granate" && "hover:border-[#981915]/70",
  );

  const inner = (
    <MatchFixtureWideScoreRow
      match={match}
      gender={gender}
      highlightTeamId={highlightTeamId}
      scoreLabel={scoreLabel}
      sublabel={timeOrDate}
      linkTeams={false}
      className="gap-0 sm:gap-0"
      scoreStripeClassName="rounded-none shadow-none"
      homeTeamClassName="text-[10px] sm:text-xs"
      awayTeamClassName="text-[10px] sm:text-xs"
    />
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
