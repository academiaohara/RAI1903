"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { CalendarNavButton } from "@/components/CalendarNavButton";
import { Card, CardHeader } from "@/components/Card";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { HomeStatHighlights } from "@/components/home/HomeStatHighlights";
import { MatchScoreCenter } from "@/components/MatchScoreCenter";
import { OpponentCrest } from "@/components/OpponentCrest";
import { RecentMatchCard } from "@/components/RecentMatchCard";
import { StandingsLeagueTableCard } from "@/components/StandingsLeagueTableCard";
import { UpcomingMatchCard } from "@/components/UpcomingMatchCard";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { useSeason } from "@/components/season/SeasonProvider";
import { isSectionUnderConstruction } from "@/lib/cms/section-status-bundle";
import { useMasculinoLeagueSeason } from "@/hooks/useMasculinoLeagueSeason";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { getMatchArticlePageHref } from "@/lib/match-article-url";
import { matchCompetitionShortLabel, matchFixtureMeta, matchRoundBadgeLabel } from "@/lib/competition-labels";
import { getTeamByGender } from "@/lib/fixtures";
import { seasonHasCompetitionBundles } from "@/lib/season/cms-data-policy";
import { primerEquipoBase } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import {
  matchFixtureBannerDesktopGridClassName,
  matchFixtureCardClassName,
  matchFixtureCardMobileWidthClassName,
  matchFixtureDesktopCardMinHeightClassName,
} from "@/lib/match-card-styles";
import { cn, formatMatchDate, formatMatchDay, formatMatchTime } from "@/lib/utils";
import type { Route } from "next";
import type { Match } from "@/types";

const HOME_MASCULINO_SCOPE = "masculino" as const;

const HOME_JORNADAS_PUBLIC_HINT =
  "Estamos preparando los partidos para esta temporada. Elige otra temporada en el selector de arriba para ver resultados y calendario de temporadas anteriores.";

const HOME_COMPETICION_PUBLIC_HINT =
  "Estamos preparando la clasificación para esta temporada. Elige otra temporada en el selector de arriba para ver la tabla de temporadas anteriores.";

export function useHomeCompetitionEmptyHint(): boolean {
  const { leagueMatchdays, bundlesLoading } = useMasculinoLeagueSeason();
  const { viewedSeasonId, getBundles, isBundlesLoading, bundles } = useSeason();
  const viewedBundles = getBundles(viewedSeasonId);
  const sectionStatusReady =
    !isSupabaseConfigured() || (!bundlesLoading && !isBundlesLoading(viewedSeasonId));
  const jornadasUnderConstruction =
    sectionStatusReady && isSectionUnderConstruction(bundles, HOME_MASCULINO_SCOPE, "jornadas");
  const competicionUnderConstruction =
    sectionStatusReady && isSectionUnderConstruction(bundles, HOME_MASCULINO_SCOPE, "competicion");

  return (
    sectionStatusReady &&
    !jornadasUnderConstruction &&
    !competicionUnderConstruction &&
    !seasonHasCompetitionBundles(viewedBundles) &&
    leagueMatchdays.length === 0
  );
}

export function HomeCompetitionEmptyHint() {
  if (!useHomeCompetitionEmptyHint()) return null;

  return (
    <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600">
      Calendario y clasificación en preparación para esta temporada.
    </p>
  );
}

export function HomeMatchBannersBlock() {
  const { latestMatches, nextMatch } = useMasculinoLeagueSeason();
  const { getForMatch } = useSeasonMatchArticles();

  const latestMatch = latestMatches[0];
  const latestArticle = latestMatch ? getForMatch(latestMatch.id, "masculino") : undefined;
  const nextArticle = nextMatch ? getForMatch(nextMatch.id, "masculino") : undefined;

  const matchBannerHeaders =
    latestMatch || nextMatch ? (
      <div className="grid gap-4">
        {latestMatch && (
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#981915]">Ultimo partido</p>
        )}
        {nextMatch && (
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#981915]">Proximo partido</p>
        )}
      </div>
    ) : undefined;

  return (
    <SectionUnderConstructionGate
      scope={HOME_MASCULINO_SCOPE}
      section="jornadas"
      publicHintOverride={HOME_JORNADAS_PUBLIC_HINT}
      header={matchBannerHeaders}
    >
    {(latestMatch || nextMatch) ? (
    <section className="grid gap-4">
      {latestMatch && (
        <MatchBanner
          match={latestMatch}
          label="Ultimo partido"
          href={
            getMatchArticlePageHref(
              latestMatch.id,
              "masculino",
              latestArticle?.id ?? defaultCronicaId(latestMatch.id, "masculino"),
            ) ?? (`${primerEquipoBase("masculino")}/calendario` as Route)
          }
        />
      )}
      {nextMatch && (
        <MatchBanner
          match={nextMatch}
          label="Proximo partido"
          href={
            getMatchArticlePageHref(
              nextMatch.id,
              "masculino",
              nextArticle?.id ?? defaultCronicaId(nextMatch.id, "masculino"),
            ) ?? (`${primerEquipoBase("masculino")}/calendario` as Route)
          }
          accent="granate"
        />
      )}
    </section>
    ) : null}
    </SectionUnderConstructionGate>
  );
}

export function HomeStandingsStatsBlock() {
  const { teams, leagueMatchdays, highlightTeamId, standingsZones, competitionConfig, bundlesLoading } =
    useMasculinoLeagueSeason();

  if (bundlesLoading) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600">
        Cargando clasificación de la temporada…
      </p>
    );
  }

  return (
    <section className="grid min-w-0 gap-6 xl:grid-cols-[1fr_0.42fr]">
      <div className="min-w-0">
        <SectionUnderConstructionGate
          scope={HOME_MASCULINO_SCOPE}
          section="competicion"
          publicHintOverride={HOME_COMPETICION_PUBLIC_HINT}
          header={<CardHeader eyebrow="Estado competitivo" title="Clasificacion y jornada" />}
        >
          <StandingsLeagueTableCard
            eyebrow="Estado competitivo"
            sourceTeams={teams}
            matchdays={leagueMatchdays}
            highlightTeamId={highlightTeamId}
            compact
            zones={standingsZones}
            zoneRules={competitionConfig.zones}
          />
        </SectionUnderConstructionGate>
      </div>
      <Card
        className="min-w-0"
        eyebrow="Jugadores destacados"
        title="Estadisticas"
        action={
          <Link
            href={`${primerEquipoBase("masculino")}/plantilla` as Route}
            className="inline-flex items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
            aria-label="Ir a estadisticas"
          >
            <Users size={16} />
          </Link>
        }
      >
        <HomeStatHighlights />
      </Card>
    </section>
  );
}

export function HomeRecentUpcomingBlock() {
  const { latestMatches, upcomingMatches, bundlesLoading } = useMasculinoLeagueSeason();
  const calendarioHref = `${primerEquipoBase("masculino")}/calendario` as Route;

  if (bundlesLoading) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600">
        Cargando calendario de la temporada…
      </p>
    );
  }

  const sectionHeaders = (
    <>
      <section className="grid gap-6 xl:hidden">
        <section>
          <CardHeader eyebrow="Resultados" title="Ultimos 5 partidos" />
        </section>
        <section>
          <CardHeader
            eyebrow="Calendario"
            title="Proximos 5 partidos"
            action={<CalendarNavButton href={calendarioHref} />}
          />
        </section>
      </section>

      <section className="hidden space-y-4 xl:block">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">Resultados</p>
            <h2 className="text-3xl font-extrabold uppercase text-[#214C9B]">Ultimos 5 partidos</h2>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">Calendario</p>
              <h2 className="text-3xl font-extrabold uppercase text-[#214C9B]">Proximos 5 partidos</h2>
            </div>
            <CalendarNavButton href={calendarioHref} />
          </div>
        </div>
      </section>
    </>
  );

  return (
    <SectionUnderConstructionGate
      scope={HOME_MASCULINO_SCOPE}
      section="jornadas"
      publicHintOverride={HOME_JORNADAS_PUBLIC_HINT}
      header={sectionHeaders}
    >
    <>
      <section className="grid gap-6 xl:hidden">
        <Card eyebrow="Resultados" title="Ultimos 5 partidos">
          <div className="space-y-2">
            {latestMatches.length > 0 ? (
              latestMatches.map((match) => (
                <RecentMatchCard key={match.id} match={match} />
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
                No hay partidos finalizados en esta temporada.
              </p>
            )}
          </div>
        </Card>
        <Card
          eyebrow="Calendario"
          title="Proximos 5 partidos"
          action={<CalendarNavButton href={calendarioHref} />}
        >
          <div className="space-y-2">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => <UpcomingMatchCard key={match.id} match={match} />)
            ) : (
              <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
                No hay proximos partidos actualmente.
              </p>
            )}
          </div>
        </Card>
      </section>

      <section className="hidden space-y-4 xl:block">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">Resultados</p>
            <h2 className="text-3xl font-extrabold uppercase text-[#214C9B]">Ultimos 5 partidos</h2>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">Calendario</p>
              <h2 className="text-3xl font-extrabold uppercase text-[#214C9B]">Proximos 5 partidos</h2>
            </div>
            <CalendarNavButton href={calendarioHref} />
          </div>
        </div>
        <div className="grid grid-cols-2 items-start gap-6">
          <div className="flex flex-col gap-3">
            {latestMatches.length > 0 ? (
              latestMatches.map((match) => <RecentMatchCard key={match.id} match={match} />)
            ) : (
              <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
                No hay partidos finalizados en esta temporada.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => <UpcomingMatchCard key={match.id} match={match} />)
            ) : (
              <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
                No hay proximos partidos actualmente.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
    </SectionUnderConstructionGate>
  );
}

function teamCrestLogo(teamId: string): string {
  const team = getTeamByGender(teamId, "masculino");
  return getTeamCrestById(teamId, team?.crestInitials);
}

type MatchBannerAccent = "blue" | "granate";

function matchCenterAccentClass(accent: MatchBannerAccent): string {
  return accent === "granate" ? "bg-[#981915]" : "bg-[#214C9B]";
}

function MatchBanner({
  match,
  label,
  href,
  accent = "blue",
}: {
  match: Match;
  label: string;
  href: Route;
  accent?: MatchBannerAccent;
}) {
  const roundBadgeLabel = matchRoundBadgeLabel(match);
  const competitionLabel = matchCompetitionShortLabel(match);
  const centerRoundLabel = roundBadgeLabel;
  const scoreLabel = match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : formatMatchTime(match.date);
  const dateLabel = match.status === "finished" ? formatMatchDate(match.date) : formatMatchDay(match.date);
  const centerAccent = matchCenterAccentClass(accent);

  return (
    <div className="space-y-2 md:space-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#981915] md:hidden">{label}</p>
      <Link
        href={href}
        className={cn(
          matchFixtureCardClassName,
          "group block w-full transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(17,24,39,0.08)]",
          matchFixtureDesktopCardMinHeightClassName,
        )}
      >
        <div
          className={cn(
            "mx-auto grid grid-cols-3 items-stretch md:hidden",
            matchFixtureCardMobileWidthClassName,
          )}
        >
          <div className="flex items-center justify-center bg-white p-3">
            <OpponentCrest logo={teamCrestLogo(match.homeTeamId)} opponent={match.homeTeam} size="md" className="mx-auto" />
          </div>
          <div className={cn("flex min-w-0 flex-col items-center justify-center px-2 py-3 text-center text-white", centerAccent)}>
            {centerRoundLabel && (
              <p className="w-full break-words text-xs font-extrabold uppercase tracking-normal text-white/90">{centerRoundLabel}</p>
            )}
            <p className={`font-extrabold leading-none text-white ${centerRoundLabel ? "mt-1 text-2xl" : "text-3xl"}`}>{scoreLabel}</p>
            <p className="mt-1 w-full break-words text-[10px] font-bold uppercase tracking-normal text-white/80">{dateLabel}</p>
            <p className="mt-1 w-full break-words text-[11px] font-bold leading-snug text-white/90">{match.venue}</p>
          </div>
          <div className="flex items-center justify-center p-3">
            <OpponentCrest logo={teamCrestLogo(match.awayTeamId)} opponent={match.awayTeam} size="md" className="mx-auto" />
          </div>
        </div>

        <div className={cn("hidden min-h-[7.5rem] md:grid", matchFixtureBannerDesktopGridClassName)}>
          <div className="flex min-w-0 items-center gap-2 p-4 lg:gap-4 lg:p-5">
            {roundBadgeLabel && (
              <span className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 bg-blue-50 px-2 text-center text-xs font-extrabold leading-tight text-[#214C9B] transition group-hover:border-[#214C9B] group-hover:bg-[#214C9B] group-hover:text-white lg:h-14 lg:min-w-14 lg:text-sm">
                {roundBadgeLabel}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-normal text-[#981915]">{label}</p>
              <p className="mt-1 break-words text-lg font-extrabold leading-tight text-slate-900 lg:text-xl">{match.homeTeam}</p>
            </div>
          </div>
          <MatchScoreCenter
            homeLogo={teamCrestLogo(match.homeTeamId)}
            homeTeam={match.homeTeam}
            awayLogo={teamCrestLogo(match.awayTeamId)}
            awayTeam={match.awayTeam}
            centerLabel={scoreLabel}
            sublabel={dateLabel}
            className={centerAccent}
          />
          <div className="flex min-w-0 items-center p-4 text-right lg:p-5">
            <div className="min-w-0 w-full">
              <p className="flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-normal text-[#981915]">
                <CompetitionLogo competition={match.competition} alt={competitionLabel} size="xs" />
                {matchFixtureMeta(match)}
              </p>
              <p className="mt-1 break-words text-lg font-extrabold leading-tight text-slate-900 lg:text-xl">{match.awayTeam}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
