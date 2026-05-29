import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Calendar, ChevronLeft, Clock, MapPin, User, Users } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { matchCompetitionShortLabel, matchJornadaLabel } from "@/lib/competition-labels";
import { getTeamByGender } from "@/lib/fixtures";
import { getTeamCrest } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { MatchDetail } from "@/types";
import type { Route } from "next";

type MatchCenterHeaderProps = {
  detail: MatchDetail;
  backHref: Route;
  backLabel: string;
};

export function MatchCenterHeader({ detail, backHref, backLabel }: MatchCenterHeaderProps) {
  const { match, gender, referee, attendance, kickoffTime, kickoffDateLabel, seasonLabel } = detail;
  const homeTeam = getTeamByGender(match.homeTeamId, gender);
  const awayTeam = getTeamByGender(match.awayTeamId, gender);
  const isFinished = match.status === "finished";
  const jornada = matchJornadaLabel(match);
  const meta = [matchCompetitionShortLabel(match), jornada, seasonLabel].filter(Boolean).join(" · ");

  return (
    <header className="overflow-hidden rounded-[2rem] bg-[#214C9B] text-white shadow-[0_20px_50px_rgba(33,76,155,0.35)]">
      <div className="px-4 py-4 sm:px-8 sm:py-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-bold text-white/90 transition hover:text-white"
        >
          <ChevronLeft size={18} aria-hidden />
          {backLabel}
        </Link>

        <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-white/85">{meta}</p>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <OpponentCrest logo={homeTeam ? getTeamCrest(homeTeam) : "LOC"} opponent={match.homeTeam} size="md" className="border-white/30 bg-white/10 text-white" />
            <p className="text-xs font-extrabold uppercase leading-tight sm:text-sm">{match.homeTeam}</p>
          </div>

          <div className="text-center">
            {isFinished && match.homeScore !== undefined && match.awayScore !== undefined ? (
              <p className="text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl">
                {match.homeScore} - {match.awayScore}
              </p>
            ) : (
              <p className="text-3xl font-extrabold uppercase sm:text-4xl">VS</p>
            )}
            <p className="mt-1 text-sm font-bold text-white/80">{kickoffTime}</p>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <OpponentCrest logo={awayTeam ? getTeamCrest(awayTeam) : "VIS"} opponent={match.awayTeam} size="md" className="border-white/30 bg-white/10 text-white" />
            <p className="text-xs font-extrabold uppercase leading-tight sm:text-sm">{match.awayTeam}</p>
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl">
          {match.homeTeam} vs {match.awayTeam}
        </h1>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-white/90 sm:text-sm">
          <li className="inline-flex items-center gap-1.5">
            <User size={14} aria-hidden />
            {referee}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Calendar size={14} aria-hidden />
            {kickoffDateLabel}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Clock size={14} aria-hidden />
            {kickoffTime}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <MapPin size={14} aria-hidden />
            {match.venue}
          </li>
          {attendance !== null && (
            <li className="inline-flex items-center gap-1.5">
              <Users size={14} aria-hidden />
              {attendance.toLocaleString("es-ES")}
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

export function MatchCenterTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; icon: LucideIcon }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="flex flex-nowrap justify-between gap-2 sm:flex-wrap sm:justify-start" aria-label="Secciones del partido">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full transition",
              "size-11 sm:size-auto sm:px-4 sm:py-2 sm:text-xs sm:font-extrabold sm:uppercase sm:tracking-normal sm:text-sm",
              isActive ? "bg-[#214C9B] text-white shadow-md" : "border border-[#214C9B]/20 bg-white text-[#214C9B] hover:border-[#214C9B]",
            )}
            aria-label={tab.label}
            aria-pressed={isActive}
          >
            <Icon size={20} className="sm:hidden" aria-hidden />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
