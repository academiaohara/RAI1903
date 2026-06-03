"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Calendar, ChevronLeft, Clock, MapPin, User, Users } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { headerLinkHoverClass, TeamLink } from "@/components/TeamLink";
import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { StadiumModal } from "@/components/squad/StadiumModal";
import { matchCompetitionShortLabel, matchJornadaLabel } from "@/lib/competition-labels";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { getRaiTeamId, getTeamByGender } from "@/lib/fixtures";
import { resolveSquadPlayerByName } from "@/lib/squad-player-resolve";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getTeamCrest, getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { MatchDetail, MatchEvent } from "@/types";
import type { SquadPlayer } from "@/types/squad";
import type { Route } from "next";

type GroupedScorer = {
  player: string;
  minutes: number[];
};

function groupGoalsByPlayer(goals: MatchEvent[]): GroupedScorer[] {
  const order: string[] = [];
  const byPlayer = new Map<string, number[]>();

  for (const goal of goals) {
    if (!byPlayer.has(goal.player)) {
      order.push(goal.player);
      byPlayer.set(goal.player, []);
    }
    byPlayer.get(goal.player)!.push(goal.minute);
  }

  return order.map((player) => ({
    player,
    minutes: byPlayer.get(player)!.sort((a, b) => a - b),
  }));
}

function TeamScorers({
  goals,
  align,
  isAviles,
  squad,
  onPlayerClick,
}: {
  goals: MatchEvent[];
  align: "left" | "right";
  isAviles: boolean;
  squad: SquadPlayer[];
  onPlayerClick: (player: SquadPlayer) => void;
}) {
  const grouped = groupGoalsByPlayer(goals);
  if (grouped.length === 0) return null;

  return (
    <ul className={cn("flex flex-col gap-0.5", align === "left" ? "items-start text-left" : "items-end text-right")}>
      {grouped.map((entry) => {
        const squadPlayer = isAviles ? resolveSquadPlayerByName(squad, entry.player) : undefined;
        const minutesLabel = entry.minutes.map((minute) => `${minute}'`).join(", ");
        const playerName = entry.player || "Sin nombre";

        return (
          <li
            key={entry.player}
            className={cn(
              "text-[10px] font-semibold text-white/85 sm:text-xs",
              align === "left" ? "text-left" : "text-right",
            )}
          >
            <span className="tabular-nums">{minutesLabel}</span>{" "}
            {squadPlayer ? (
              <button
                type="button"
                onClick={() => onPlayerClick(squadPlayer)}
                className={cn("cursor-pointer", headerLinkHoverClass)}
              >
                {playerName}
              </button>
            ) : (
              <span className={headerLinkHoverClass}>{playerName}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type MatchCenterHeaderProps = {
  detail: MatchDetail;
  backHref: Route;
  backLabel: string;
};

function ScoreInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value ?? ""}
      onChange={(event) => {
        const raw = event.target.value;
        onChange(raw === "" ? undefined : Number(raw));
      }}
      aria-label={ariaLabel}
      className="w-14 rounded-xl border border-white/35 bg-white/10 px-2 py-1 text-center text-3xl font-extrabold tabular-nums text-white outline-none focus:border-white sm:w-16 sm:text-4xl"
    />
  );
}

export function MatchCenterHeader({ detail, backHref, backLabel }: MatchCenterHeaderProps) {
  const { match, gender, referee, attendance, kickoffTime, kickoffDateLabel, seasonLabel } = detail;
  const { editMode, getValue, saveValue } = useInlineEditing();
  const keys = useMatchDetailStorageKeys(match.id);
  const [selectedPlayer, setSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [stadiumOpen, setStadiumOpen] = useState(false);

  const homeScore = getValue(keys.homeScore, match.homeScore);
  const awayScore = getValue(keys.awayScore, match.awayScore);
  const currentAttendance = getValue(keys.attendance, attendance);
  const currentReferee = getValue(keys.referee, referee);

  const homeTeam = getTeamByGender(match.homeTeamId, gender);
  const awayTeam = getTeamByGender(match.awayTeamId, gender);
  const raiId = getRaiTeamId(gender);
  const isHomeAviles = match.homeTeamId === raiId;
  const isAwayAviles = match.awayTeamId === raiId;
  const { squad: avilesSquad, updatePlayer } = useSquadPlayers(gender);
  const avilesSquadForMatch = isHomeAviles || isAwayAviles ? avilesSquad : [];
  const homeStadiumInfo = useMemo(() => {
    if (!homeTeam) return null;
    return getCompeticionSquadData(gender, homeTeam).club.estadioInfo;
  }, [gender, homeTeam]);
  const showPlayerModal = gender === "masculino";

  const currentEvents = getValue(keys.events, detail.events);
  const homeGoals = currentEvents
    .filter((event) => event.type === "goal" && event.team === "home")
    .sort((a, b) => a.minute - b.minute);
  const awayGoals = currentEvents
    .filter((event) => event.type === "goal" && event.team === "away")
    .sort((a, b) => a.minute - b.minute);
  const isFinished = match.status === "finished";
  const jornada = matchJornadaLabel(match);
  const meta = [matchCompetitionShortLabel(match), jornada, seasonLabel].filter(Boolean).join(" · ");
  const showReferee = Boolean(currentReferee) || editMode;
  const showAttendance = isFinished && (currentAttendance !== null || editMode);

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
          <div className="flex flex-col items-center gap-2">
            <TeamLink gender={gender} teamId={match.homeTeamId} teamName={match.homeTeam} className="flex flex-col items-center gap-2 text-center">
              <OpponentCrest
                logo={homeTeam ? getTeamCrest(homeTeam) : getTeamCrestById(match.homeTeamId, "LOC")}
                opponent={match.homeTeam}
                size="md"
              />
              <span className="text-xs font-extrabold uppercase leading-tight sm:text-sm">{match.homeTeam}</span>
            </TeamLink>
            <div className="flex w-full justify-start">
              <TeamScorers
                goals={homeGoals}
                align="left"
                isAviles={isHomeAviles}
                squad={avilesSquadForMatch}
                onPlayerClick={setSelectedPlayer}
              />
            </div>
          </div>

          <div className="text-center">
            {isFinished ? (
              editMode ? (
                <div className="flex items-center justify-center gap-2">
                  <ScoreInput
                    value={homeScore}
                    onChange={(value) => saveValue(keys.homeScore, value)}
                    ariaLabel="Goles local"
                  />
                  <span className="text-3xl font-extrabold sm:text-4xl">-</span>
                  <ScoreInput
                    value={awayScore}
                    onChange={(value) => saveValue(keys.awayScore, value)}
                    ariaLabel="Goles visitante"
                  />
                </div>
              ) : homeScore !== undefined && awayScore !== undefined ? (
                <p className="text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl">
                  {homeScore} - {awayScore}
                </p>
              ) : (
                <p className="text-3xl font-extrabold uppercase sm:text-4xl">VS</p>
              )
            ) : (
              <p className="text-3xl font-extrabold uppercase sm:text-4xl">VS</p>
            )}
            <p className="mt-1 text-sm font-bold text-white/80">{kickoffTime}</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <TeamLink gender={gender} teamId={match.awayTeamId} teamName={match.awayTeam} className="flex flex-col items-center gap-2 text-center">
              <OpponentCrest
                logo={awayTeam ? getTeamCrest(awayTeam) : getTeamCrestById(match.awayTeamId, "VIS")}
                opponent={match.awayTeam}
                size="md"
              />
              <span className="text-xs font-extrabold uppercase leading-tight sm:text-sm">{match.awayTeam}</span>
            </TeamLink>
            <div className="flex w-full justify-end">
              <TeamScorers
                goals={awayGoals}
                align="right"
                isAviles={isAwayAviles}
                squad={avilesSquadForMatch}
                onPlayerClick={setSelectedPlayer}
              />
            </div>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-white/90 sm:text-sm">
          {showReferee && (
            <li className="inline-flex items-center gap-1.5">
              <User size={14} aria-hidden />
              <EditableText
                storageKey={keys.referee}
                value={currentReferee}
                placeholder="Árbitro"
                aria-label="Editar arbitro"
                inputClassName="text-xs font-bold text-slate-800 sm:text-sm"
              />
            </li>
          )}
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
            {homeStadiumInfo ? (
              <button
                type="button"
                onClick={() => setStadiumOpen(true)}
                className="cursor-pointer transition hover:text-white"
              >
                {match.venue}
              </button>
            ) : (
              match.venue
            )}
          </li>
          {showAttendance && (
            <li className="inline-flex items-center gap-1.5">
              <Users size={14} aria-hidden />
              {editMode ? (
                <input
                  type="number"
                  min={0}
                  value={currentAttendance ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value;
                    saveValue(keys.attendance, raw === "" ? null : Number(raw));
                  }}
                  placeholder="Espectadores"
                  aria-label="Editar espectadores"
                  className="w-28 rounded-lg border border-white/35 bg-white/10 px-2 py-1 text-xs font-bold text-white outline-none focus:border-white sm:text-sm"
                />
              ) : (
                currentAttendance?.toLocaleString("es-ES")
              )}
            </li>
          )}
        </ul>
      </div>
      {showPlayerModal && (
        <PlayerModal
          player={
            selectedPlayer
              ? avilesSquad.find((entry) => entry.id === selectedPlayer.id) ?? selectedPlayer
              : null
          }
          onClose={() => setSelectedPlayer(null)}
          onUpdate={updatePlayer}
        />
      )}
      <StadiumModal stadium={homeStadiumInfo} open={stadiumOpen} onClose={() => setStadiumOpen(false)} />
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
