import Link from "next/link";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { MatchScoreCenter } from "@/components/MatchScoreCenter";
import { OpponentCrest } from "@/components/OpponentCrest";
import { matchCompetitionShortLabel, matchFixtureMeta, matchRoundBadgeLabel } from "@/lib/competition-labels";
import { getTeamByGender } from "@/lib/fixtures";
import {
  matchFixtureBannerDesktopGridClassName,
  matchFixtureCardClassName,
  matchFixtureCardMobileWidthClassName,
  matchFixtureDesktopCardMinHeightClassName,
} from "@/lib/match-card-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn, formatMatchTime, formatMatchWeekdayLetterDate } from "@/lib/utils";
import type { Route } from "next";
import type { Match } from "@/types";

export type MatchBannerAccent = "blue" | "granate";

type MatchBannerProps = {
  match: Match;
  label: string;
  href: Route;
  accent?: MatchBannerAccent;
  gender?: PrimerEquipoGender;
  getCrestForTeam?: (teamId: string, teamName: string) => string;
};

function defaultCrestForTeam(teamId: string, teamName: string, gender: PrimerEquipoGender): string {
  const team = getTeamByGender(teamId, gender);
  const initials =
    team?.crestInitials ?? teamName.replace(/\s+U19$/i, "").slice(0, 3).toUpperCase();
  return getTeamCrestById(teamId, initials);
}

function matchBannerCenterSwapClass(accent: MatchBannerAccent): string {
  return accent === "granate"
    ? "bg-[#981915] text-white group-hover:bg-white group-hover:text-[#981915]"
    : "bg-[#214C9B] text-white group-hover:bg-white group-hover:text-[#214C9B]";
}

function matchBannerCenterMutedTextClass(accent: MatchBannerAccent, opacity: "80" | "90"): string {
  return accent === "granate"
    ? `text-white/${opacity} group-hover:text-[#981915]/${opacity}`
    : `text-white/${opacity} group-hover:text-[#214C9B]/${opacity}`;
}

function matchBannerRoundBadgeClass(accent: MatchBannerAccent): string {
  return accent === "granate"
    ? "flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl border border-[#981915] bg-[#981915] px-2 text-center text-xs font-extrabold leading-tight text-white transition-colors duration-200 group-hover:border-[#981915]/20 group-hover:bg-white group-hover:text-[#981915] lg:h-14 lg:min-w-14 lg:text-sm"
    : "flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl border border-[#214C9B] bg-[#214C9B] px-2 text-center text-xs font-extrabold leading-tight text-white transition-colors duration-200 group-hover:border-[#214C9B]/20 group-hover:bg-white group-hover:text-[#214C9B] lg:h-14 lg:min-w-14 lg:text-sm";
}

function matchBannerSidePanelClass(accent: MatchBannerAccent): string {
  return accent === "granate"
    ? "transition-colors duration-200 group-hover:bg-[#981915]"
    : "transition-colors duration-200 group-hover:bg-[#214C9B]";
}

function matchBannerSideEyebrowClass(): string {
  return "text-[#981915] transition-colors duration-200 group-hover:text-white";
}

function matchBannerSideTitleClass(): string {
  return "text-slate-900 transition-colors duration-200 group-hover:text-white";
}

export function MatchBanner({
  match,
  label,
  href,
  accent = "blue",
  gender = "masculino",
  getCrestForTeam,
}: MatchBannerProps) {
  const resolveCrest = (teamId: string, teamName: string) =>
    getCrestForTeam?.(teamId, teamName) ?? defaultCrestForTeam(teamId, teamName, gender);

  const roundBadgeLabel = matchRoundBadgeLabel(match);
  const competitionLabel = matchCompetitionShortLabel(match);
  const centerRoundLabel = roundBadgeLabel;
  const scoreLabel =
    match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : formatMatchTime(match.date);
  const dateLabel = formatMatchWeekdayLetterDate(match.date);
  const centerSwap = matchBannerCenterSwapClass(accent);
  const sidePanel = matchBannerSidePanelClass(accent);

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
          <div className={cn("flex items-center justify-center bg-white p-3", sidePanel)}>
            <OpponentCrest
              logo={resolveCrest(match.homeTeamId, match.homeTeam)}
              opponent={match.homeTeam}
              teamId={match.homeTeamId}
              onGranateBackgroundHover={accent === "granate"}
              size="md"
              className="mx-auto"
            />
          </div>
          <div
            className={cn(
              "flex min-w-0 flex-col items-center justify-center px-2 py-3 text-center transition-colors duration-200",
              centerSwap,
            )}
          >
            {centerRoundLabel && (
              <p
                className={cn(
                  "w-full break-words text-xs font-extrabold uppercase tracking-normal transition-colors duration-200",
                  matchBannerCenterMutedTextClass(accent, "90"),
                )}
              >
                {centerRoundLabel}
              </p>
            )}
            <p
              className={cn(
                "font-extrabold leading-none transition-colors duration-200",
                centerRoundLabel ? "mt-1 text-2xl" : "text-3xl",
              )}
            >
              {scoreLabel}
            </p>
            <p
              className={cn(
                "mt-1 w-full break-words text-[10px] font-bold uppercase tracking-normal transition-colors duration-200",
                matchBannerCenterMutedTextClass(accent, "80"),
              )}
            >
              {dateLabel}
            </p>
            <p
              className={cn(
                "mt-1 w-full break-words text-[11px] font-bold leading-snug transition-colors duration-200",
                matchBannerCenterMutedTextClass(accent, "90"),
              )}
            >
              {match.venue}
            </p>
          </div>
          <div className={cn("flex items-center justify-center p-3", sidePanel)}>
            <OpponentCrest
              logo={resolveCrest(match.awayTeamId, match.awayTeam)}
              opponent={match.awayTeam}
              teamId={match.awayTeamId}
              onGranateBackgroundHover={accent === "granate"}
              size="md"
              className="mx-auto"
            />
          </div>
        </div>

        <div className={cn("hidden min-h-[7.5rem] md:grid", matchFixtureBannerDesktopGridClassName)}>
          <div className={cn("flex min-w-0 items-center gap-2 p-4 lg:gap-4 lg:p-5", sidePanel)}>
            {roundBadgeLabel && (
              <span className={matchBannerRoundBadgeClass(accent)}>{roundBadgeLabel}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className={matchBannerSideEyebrowClass()}>{label}</p>
              <p
                className={cn(
                  "mt-1 break-words text-lg font-extrabold leading-tight lg:text-xl",
                  matchBannerSideTitleClass(),
                )}
              >
                {match.homeTeam}
              </p>
            </div>
          </div>
          <MatchScoreCenter
            homeLogo={resolveCrest(match.homeTeamId, match.homeTeam)}
            homeTeam={match.homeTeam}
            homeTeamId={match.homeTeamId}
            awayLogo={resolveCrest(match.awayTeamId, match.awayTeam)}
            awayTeam={match.awayTeam}
            awayTeamId={match.awayTeamId}
            centerLabel={scoreLabel}
            sublabel={dateLabel}
            className={centerSwap}
            accent={accent}
          />
          <div className={cn("flex min-w-0 items-center p-4 text-right lg:p-5", sidePanel)}>
            <div className="min-w-0 w-full">
              <p
                className={cn(
                  "flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-normal",
                  matchBannerSideEyebrowClass(),
                )}
              >
                <CompetitionLogo competition={match.competition} alt={competitionLabel} size="xs" />
                {matchFixtureMeta(match)}
              </p>
              <p
                className={cn(
                  "mt-1 break-words text-lg font-extrabold leading-tight lg:text-xl",
                  matchBannerSideTitleClass(),
                )}
              >
                {match.awayTeam}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
