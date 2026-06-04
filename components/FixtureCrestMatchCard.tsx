"use client";

import Link from "next/link";
import { OpponentCrest } from "@/components/OpponentCrest";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { getTeamByGender } from "@/lib/fixtures";
import { fixtureCrestMatchCardClassName } from "@/lib/match-card-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { primerEquipoBase, primerEquipoHasCronicas } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn, formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";
import type { Route } from "next";

export type FixtureCrestMatchAccent = "blue" | "granate";

function matchCenterAccentClass(accent: FixtureCrestMatchAccent): string {
  return accent === "granate" ? "bg-[#981915]" : "bg-[#214C9B]";
}

function teamCrestLogo(teamId: string, gender: PrimerEquipoGender): string {
  const team = getTeamByGender(teamId, gender);
  return getTeamCrestById(teamId, team?.crestInitials);
}

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
  const scoreLabel = match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : "vs";
  const centerAccent = matchCenterAccentClass(accent);
  const timeOrDate =
    match.status === "scheduled"
      ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(match.date))
      : formatMatchDate(match.date);

  const inner = (
    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
      <div className="flex items-center justify-center p-2.5">
        <OpponentCrest logo={teamCrestLogo(match.homeTeamId, gender)} opponent={match.homeTeam} size="md" className="mx-auto" />
      </div>
      <div className={cn("flex w-24 shrink-0 flex-col items-center justify-center px-1.5 py-2.5 text-center text-white", centerAccent)}>
        <p className="text-xl font-extrabold leading-none">{scoreLabel}</p>
        <p className="mt-1 w-full break-words text-[9px] font-bold uppercase leading-snug text-white/85">{timeOrDate}</p>
      </div>
      <div className="flex items-center justify-center p-2.5">
        <OpponentCrest logo={teamCrestLogo(match.awayTeamId, gender)} opponent={match.awayTeam} size="md" className="mx-auto" />
      </div>
    </div>
  );

  if (!linkable) {
    return <div className={fixtureCrestMatchCardClassName}>{inner}</div>;
  }

  return (
    <Link
      href={linkHref}
      className={fixtureCrestMatchCardClassName}
      aria-label={`${match.homeTeam} ${scoreLabel} ${match.awayTeam}`}
    >
      {inner}
    </Link>
  );
}
