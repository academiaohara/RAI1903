"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/Card";
import { MatchBanner } from "@/components/home/MatchBanner";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { useSeason } from "@/components/season/SeasonProvider";
import { usePrimerEquipoLeagueSeason } from "@/hooks/usePrimerEquipoLeagueSeason";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { resolveCanteraSeasonData } from "@/lib/cantera/cantera-season-data";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { getMatchArticlePageHref } from "@/lib/match-article-url";
import { latestMatchesBeforeToday, upcomingMatchesAfterToday } from "@/lib/match-calendar-dates";
import { genderLabels, primerEquipoBase } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import type { SeasonBundleScope } from "@/lib/cms/season-bundles";
import type { Route } from "next";
import type { Match } from "@/types";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

const CANTERA_CREST = (teamId: string, teamName: string) =>
  getTeamCrestById(teamId, teamName.replace(/\s+U19$/i, "").slice(0, 3).toUpperCase());

type TeamSectionConfig = {
  eyebrow: string;
  title: string;
  href: Route;
};

function TeamSectionHeader({ config }: { config: TeamSectionConfig }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#981915] sm:text-xs">
          {config.eyebrow}
        </p>
        <h3 className="mt-0.5 text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:text-xl">
          {config.title}
        </h3>
      </div>
      <Link
        href={config.href}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
      >
        Ver seccion
        <ExternalLink size={14} aria-hidden />
      </Link>
    </div>
  );
}

function TeamMatchBanners({
  latestMatch,
  nextMatch,
  latestHref,
  nextHref,
  gender,
  getCrestForTeam,
}: {
  latestMatch?: Match;
  nextMatch?: Match;
  latestHref?: Route;
  nextHref?: Route;
  gender?: PrimerEquipoGender;
  getCrestForTeam?: (teamId: string, teamName: string) => string;
}) {
  if (!latestMatch && !nextMatch) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
        Sin partidos disponibles en esta temporada.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {latestMatch && latestHref ? (
        <MatchBanner
          match={latestMatch}
          label="Ultimo partido"
          href={latestHref}
          gender={gender}
          getCrestForTeam={getCrestForTeam}
        />
      ) : null}
      {nextMatch && nextHref ? (
        <MatchBanner
          match={nextMatch}
          label="Proximo partido"
          href={nextHref}
          accent="granate"
          gender={gender}
          getCrestForTeam={getCrestForTeam}
        />
      ) : null}
    </div>
  );
}

function useCanteraHomeMatches(scope: CanteraCmsScope) {
  const { bundles, viewedSeason } = useSeason();
  const data = useMemo(
    () => resolveCanteraSeasonData(scope, bundles, viewedSeason.label),
    [scope, bundles, viewedSeason.label],
  );
  const latestMatch = useMemo(
    () => latestMatchesBeforeToday(data.calendar, 1)[0],
    [data.calendar],
  );
  const nextMatch = useMemo(
    () => upcomingMatchesAfterToday(data.calendar, 1)[0],
    [data.calendar],
  );
  const href = (scope === "filial" ? "/cantera/filial" : "/cantera/juvenil-a") as Route;

  return { latestMatch, nextMatch, href };
}

function ScopedTeamMatchesSection({
  scope,
  config,
  latestMatch,
  nextMatch,
  latestHref,
  nextHref,
  gender,
  getCrestForTeam,
}: {
  scope: SeasonBundleScope;
  config: TeamSectionConfig;
  latestMatch?: Match;
  nextMatch?: Match;
  latestHref?: Route;
  nextHref?: Route;
  gender?: PrimerEquipoGender;
  getCrestForTeam?: (teamId: string, teamName: string) => string;
}) {
  return (
    <SectionUnderConstructionGate scope={scope} section="jornadas">
      <section className="space-y-4">
        <TeamSectionHeader config={config} />
        <TeamMatchBanners
          latestMatch={latestMatch}
          nextMatch={nextMatch}
          latestHref={latestHref}
          nextHref={nextHref}
          gender={gender}
          getCrestForTeam={getCrestForTeam}
        />
      </section>
    </SectionUnderConstructionGate>
  );
}

function FemeninoMatchesSection() {
  const { latestMatches, nextMatch } = usePrimerEquipoLeagueSeason("femenino");
  const { getForMatch } = useSeasonMatchArticles();
  const latestMatch = latestMatches[0];
  const calendarioHref = `${primerEquipoBase("femenino")}/calendario` as Route;

  const latestHref =
    latestMatch &&
    (getMatchArticlePageHref(
      latestMatch.id,
      "femenino",
      getForMatch(latestMatch.id, "femenino")?.id ?? defaultCronicaId(latestMatch.id, "femenino"),
    ) ??
      calendarioHref);

  const nextHref =
    nextMatch &&
    (getMatchArticlePageHref(
      nextMatch.id,
      "femenino",
      getForMatch(nextMatch.id, "femenino")?.id ?? defaultCronicaId(nextMatch.id, "femenino"),
    ) ??
      calendarioHref);

  return (
    <ScopedTeamMatchesSection
      scope="femenino"
      config={{
        eyebrow: "Primer equipo",
        title: genderLabels.femenino.title,
        href: primerEquipoBase("femenino") as Route,
      }}
      latestMatch={latestMatch}
      nextMatch={nextMatch}
      latestHref={latestHref || undefined}
      nextHref={nextHref || undefined}
      gender="femenino"
    />
  );
}

function FilialMatchesSection() {
  const { latestMatch, nextMatch, href } = useCanteraHomeMatches("filial");

  return (
    <ScopedTeamMatchesSection
      scope="filial"
      config={{
        eyebrow: "Cantera",
        title: "Filial",
        href,
      }}
      latestMatch={latestMatch}
      nextMatch={nextMatch}
      latestHref={href}
      nextHref={href}
      getCrestForTeam={CANTERA_CREST}
    />
  );
}

function JuvenilMatchesSection() {
  const { latestMatch, nextMatch, href } = useCanteraHomeMatches("juvenil");

  return (
    <ScopedTeamMatchesSection
      scope="juvenil"
      config={{
        eyebrow: "Cantera",
        title: "Juvenil A",
        href,
      }}
      latestMatch={latestMatch}
      nextMatch={nextMatch}
      latestHref={href}
      nextHref={href}
      getCrestForTeam={CANTERA_CREST}
    />
  );
}

export function HomeOtherTeamsMatchesBlock() {
  return (
    <Card>
      <div className="space-y-8 sm:space-y-10">
        <div className="border-b border-[#214C9B]/15 pb-8 sm:pb-10">
          <FemeninoMatchesSection />
        </div>
        <div className="border-b border-[#214C9B]/15 pb-8 sm:pb-10">
          <FilialMatchesSection />
        </div>
        <JuvenilMatchesSection />
      </div>
    </Card>
  );
}
