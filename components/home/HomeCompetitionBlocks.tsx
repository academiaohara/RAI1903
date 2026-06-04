"use client";

import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { CalendarNavButton } from "@/components/CalendarNavButton";
import { Card } from "@/components/Card";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { HomeStatHighlights } from "@/components/home/HomeStatHighlights";
import { MatchScoreCenter } from "@/components/MatchScoreCenter";
import { OpponentCrest } from "@/components/OpponentCrest";
import { FixtureCrestMatchCard } from "@/components/FixtureCrestMatchCard";
import { RecentMatchCard } from "@/components/RecentMatchCard";
import { MatchCard } from "@/components/MatchCard";
import { StandingsLeagueTableCard } from "@/components/StandingsLeagueTableCard";
import { useSeason } from "@/components/season/SeasonProvider";
import { useMasculinoLeagueSeason } from "@/hooks/useMasculinoLeagueSeason";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { matchCompetitionShortLabel, matchJornadaLabel } from "@/lib/competition-labels";
import { getTeamByGender } from "@/lib/fixtures";
import { seasonHasCompetitionBundles } from "@/lib/season/cms-data-policy";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { primerEquipoBase } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn, formatMatchDate } from "@/lib/utils";
import type { Route } from "next";
import type { Match } from "@/types";

export function useHomeCompetitionEmptyHint(): boolean {
  const { leagueMatchdays, bundlesLoading } = useMasculinoLeagueSeason();
  const { viewedSeasonId, getBundles, isBundlesLoading } = useSeason();
  const bundles = getBundles(viewedSeasonId);
  return (
    !bundlesLoading &&
    !isBundlesLoading(viewedSeasonId) &&
    !seasonHasCompetitionBundles(bundles) &&
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

  if (!latestMatch && !nextMatch) return null;

  return (
    <section className="grid gap-4">
      {latestMatch && (
        <MatchBanner
          match={latestMatch}
          label="Ultimo partido"
          href={
            `${primerEquipoBase("masculino")}/cronicas/${latestArticle?.id ?? defaultCronicaId(latestMatch.id, "masculino")}` as Route
          }
          action="Entrar en la ficha del partido"
        />
      )}
      {nextMatch && (
        <MatchBanner
          match={nextMatch}
          label="Proximo partido"
          href={
            `${primerEquipoBase("masculino")}/cronicas/${nextArticle?.id ?? defaultCronicaId(nextMatch.id, "masculino")}` as Route
          }
          action="Entrar en la ficha del partido"
          accent="granate"
        />
      )}
    </section>
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
    <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
      <StandingsLeagueTableCard
        eyebrow="Estado competitivo"
        sourceTeams={teams}
        matchdays={leagueMatchdays}
        highlightTeamId={highlightTeamId}
        compact
        zones={standingsZones}
        zoneRules={competitionConfig.zones}
      />
      <Card
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

  if (bundlesLoading) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600">
        Cargando calendario de la temporada…
      </p>
    );
  }

  return (
    <>
      <section className="grid gap-6 xl:hidden">
        <Card eyebrow="Resultados" title="Ultimos 5 partidos">
          <div className="space-y-2">
            {latestMatches.length > 0 ? (
              latestMatches.map((match) => (
                <FixtureCrestMatchCard key={match.id} match={match} accent="blue" />
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
          action={<CalendarNavButton href={`${primerEquipoBase("masculino")}/calendario` as Route} />}
        >
          <div className="space-y-2">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => <FixtureCrestMatchCard key={match.id} match={match} accent="granate" />)
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
            <CalendarNavButton href={`${primerEquipoBase("masculino")}/calendario` as Route} />
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
              upcomingMatches.map((match) => <MatchCard key={match.id} match={match} compact />)
            ) : (
              <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
                No hay proximos partidos actualmente.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
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
  action,
  accent = "blue",
}: {
  match: Match;
  label: string;
  href: Route;
  action: string;
  accent?: MatchBannerAccent;
}) {
  const jornadaLabel = matchJornadaLabel(match);
  const competitionLabel = matchCompetitionShortLabel(match);
  const centerRoundLabel = jornadaLabel ?? (match.competition === "copa-rey" ? competitionLabel : null);
  const scoreLabel = match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : "vs";
  const centerAccent = matchCenterAccentClass(accent);

  return (
    <div className="space-y-2 md:space-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#981915] md:hidden">{label}</p>
      <Link
        href={href}
        className="group block overflow-hidden rounded-xl border border-[#214C9B]/25 bg-white shadow-[0_10px_28px_rgba(17,24,39,0.06)] transition hover:-translate-y-1 hover:border-[#214C9B] md:rounded-[1.5rem] md:shadow-[0_18px_45px_rgba(17,24,39,0.08)] lg:rounded-[2rem]"
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch md:hidden">
          <div className="flex items-center justify-center p-3">
            <OpponentCrest logo={teamCrestLogo(match.homeTeamId)} opponent={match.homeTeam} size="md" className="mx-auto" />
          </div>
          <div className={cn("flex w-32 shrink-0 flex-col items-center justify-center px-2 py-3 text-center text-white", centerAccent)}>
            {centerRoundLabel && (
              <p className="w-full break-words text-xs font-extrabold uppercase tracking-normal text-white/90">{centerRoundLabel}</p>
            )}
            <p className={`font-extrabold leading-none text-white ${centerRoundLabel ? "mt-1 text-2xl" : "text-3xl"}`}>{scoreLabel}</p>
            <p className="mt-1 w-full break-words text-[10px] font-bold uppercase tracking-normal text-white/80">{formatMatchDate(match.date)}</p>
            <p className="mt-1 w-full break-words text-[11px] font-bold leading-snug text-white/90">{match.venue}</p>
          </div>
          <div className="flex items-center justify-center p-3">
            <OpponentCrest logo={teamCrestLogo(match.awayTeamId)} opponent={match.awayTeam} size="md" className="mx-auto" />
          </div>
        </div>

        <div className="hidden grid-cols-[1fr_auto_1fr] items-stretch md:grid">
          <div className="flex min-w-0 items-center gap-2 p-4 lg:gap-4 lg:p-5">
            {jornadaLabel && (
              <span className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 bg-blue-50 px-2 text-center text-xs font-extrabold leading-tight text-[#214C9B] transition group-hover:border-[#214C9B] group-hover:bg-[#214C9B] group-hover:text-white lg:h-14 lg:min-w-14 lg:text-sm">
                {jornadaLabel}
              </span>
            )}
            <div className="min-w-0">
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
            sublabel={formatMatchDate(match.date)}
          />
          <div className="flex min-w-0 items-center justify-between gap-3 p-4 lg:gap-4 lg:p-5">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-normal text-[#981915]">
                <CompetitionLogo competition={match.competition} alt={competitionLabel} size="xs" />
                {competitionLabel}
              </p>
              <p className="mt-1 break-words text-lg font-extrabold leading-tight text-slate-900 lg:text-xl">{match.awayTeam}</p>
            </div>
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#214C9B]/20 px-4 py-2 text-sm font-bold text-[#214C9B] transition group-hover:bg-[#214C9B] group-hover:text-white lg:w-auto lg:shrink-0">
              {action} <ArrowUpRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

