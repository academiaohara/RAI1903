"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { CalendarNavButton } from "@/components/CalendarNavButton";
import { Card, CardHeader } from "@/components/Card";
import { HomeStatHighlights } from "@/components/home/HomeStatHighlights";
import { MatchBanner } from "@/components/home/MatchBanner";
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
import { seasonHasCompetitionBundles } from "@/lib/season/cms-data-policy";
import { primerEquipoBase } from "@/lib/primer-equipo";
import type { Route } from "next";

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
