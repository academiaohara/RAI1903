"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MatchPreviewModal } from "@/components/MatchPreviewModal";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { RAI_TEAM_ID } from "@/data/mock";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { buildMatchDetail } from "@/lib/match-detail";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { getMatchArticlePageHref } from "@/lib/match-article-url";
import { isMatchPlayed } from "@/lib/match-result";
import { resolveSquadPlayerByName, scorerLabelForPlayer } from "@/lib/squad-player-resolve";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import {
  actualAvilesScorer,
  actualAvilesScorers,
  actualOutcome,
  formatGoalsPick,
  getActualGoalsPicks,
  getAvilesGoalsPick,
  getTeamById,
  isAvilesMatch,
  isOutcomeLockedByGoals,
  isScorerPredictionCorrect,
  outcomeFromGoalsPicks,
} from "@/lib/quiniela";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { GoalsPick, Match, Prediction, PredictionOutcome } from "@/types";
import type { SquadPlayer } from "@/types/squad";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";

const outcomes: PredictionOutcome[] = ["1", "X", "2"];
const goalOptions: GoalsPick[] = [0, 1, 2, "M"];

export type PredictionFormMode = "edit" | "results" | "compare";

type ScorerOption = { value: string; label: string };

function outcomeButtonClass({
  mode,
  outcome,
  userOutcome,
  actual,
  selected,
}: {
  mode: PredictionFormMode;
  outcome: PredictionOutcome;
  userOutcome?: PredictionOutcome;
  actual: PredictionOutcome | null;
  selected: boolean;
}): string {
  const base =
    "h-9 flex-1 rounded-xl border text-sm font-extrabold transition disabled:cursor-not-allowed sm:h-12 sm:w-12 sm:flex-none sm:rounded-2xl sm:text-lg";

  if (mode === "results") {
    const isActual = actual === outcome;
    return `${base} disabled:opacity-100 ${
      isActual
        ? "border-[#981915] bg-[#981915] text-white"
        : "border-[#214C9B]/15 bg-slate-50 text-slate-400"
    }`;
  }

  if (mode === "compare") {
    const isUser = userOutcome === outcome;
    const isActual = actual === outcome;
    if (isUser && isActual) {
      return `${base} border-[#981915] bg-[#214C9B] text-white ring-2 ring-[#981915] ring-offset-1 disabled:opacity-100`;
    }
    if (isUser) {
      return `${base} border-[#214C9B] bg-[#214C9B] text-white disabled:opacity-100`;
    }
    if (isActual) {
      return `${base} border-[#981915] bg-[#981915] text-white disabled:opacity-100`;
    }
    return `${base} border-[#214C9B]/15 bg-slate-50 text-slate-400 disabled:opacity-70`;
  }

  return `${base} disabled:opacity-70 ${
    selected
      ? "border-[#214C9B] bg-[#214C9B] text-white"
      : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
  }`;
}

export function PredictionForm({
  match,
  prediction,
  readOnly,
  mode = "edit",
  onChange,
}: {
  match: Match;
  prediction?: Prediction;
  readOnly?: boolean;
  mode?: PredictionFormMode;
  onChange: (prediction: Prediction) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { bundles } = useSeason();
  const { getForMatch } = useSeasonMatchArticles();
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const cmsTeams = useMemo(() => getTeamsBundle(bundles, "masculino")?.teams ?? [], [bundles]);
  const homeTeamName = useMemo(
    () =>
      getTeamById(match.homeTeamId, teams)?.name ??
      resolveFixtureTeamDisplayName(match.homeTeamId, match.homeTeam, cmsTeams, bundles, "masculino"),
    [bundles, cmsTeams, match.homeTeam, match.homeTeamId, teams],
  );
  const awayTeamName = useMemo(
    () =>
      getTeamById(match.awayTeamId, teams)?.name ??
      resolveFixtureTeamDisplayName(match.awayTeamId, match.awayTeam, cmsTeams, bundles, "masculino"),
    [bundles, cmsTeams, match.awayTeam, match.awayTeamId, teams],
  );
  const avilesMatch = isAvilesMatch(match);
  const avilesIsHome = match.homeTeamId === RAI_TEAM_ID;
  const avilesArticleHref = useMemo(() => {
    if (!avilesMatch) return null;
    const article = getForMatch(match.id, "masculino");
    return getMatchArticlePageHref(match.id, "masculino", article?.id ?? defaultCronicaId(match.id, "masculino"));
  }, [avilesMatch, getForMatch, match.id]);
  const avilesArticleLabel = isMatchPlayed(match) ? "Crónica" : "Previa";
  const avilesGoalsPick = prediction ? getAvilesGoalsPick(match, prediction) : undefined;
  const scorerLockedToNadie = avilesGoalsPick === 0;
  const derivedOutcome =
    prediction?.goalsHome !== undefined && prediction?.goalsAway !== undefined
      ? outcomeFromGoalsPicks(prediction.goalsHome, prediction.goalsAway)
      : null;
  const outcomeLocked = avilesMatch && isOutcomeLockedByGoals(prediction?.goalsHome, prediction?.goalsAway);
  const displayMode = mode === "edit" ? "edit" : mode;
  const isDisplayOnly = displayMode !== "edit";
  const formReadOnly = readOnly || isDisplayOnly;
  const actual = actualOutcome(match);
  const userOutcome = (outcomeLocked ? derivedOutcome : prediction?.outcome) ?? undefined;
  const homeCrest = getTeamCrestById(match.homeTeamId, getTeamById(match.homeTeamId, teams)?.crestInitials);
  const awayCrest = getTeamCrestById(match.awayTeamId, getTeamById(match.awayTeamId, teams)?.crestInitials);
  const actualGoals = getActualGoalsPicks(match);
  const { squad } = useSquadPlayers("masculino");
  const { getValue } = useInlineEditing();
  const chronicleEvents = getValue(
    `match:${match.id}:events`,
    buildMatchDetail(match, "masculino").events,
  );
  const scorerOptions = useMemo<ScorerOption[]>(
    () => [
      { value: "nadie", label: "Nadie" },
      ...squad
        .filter((player) => player.posicion !== "Portero")
        .map((player) => {
          const label = scorerLabelForPlayer(player);
          return { value: label, label };
        }),
    ],
    [squad],
  );
  const actualScorer = avilesMatch
    ? actualAvilesScorer(match, { events: chronicleEvents, squad })
    : null;
  const actualScorers = avilesMatch
    ? actualAvilesScorers(match, { events: chronicleEvents, squad })
    : [];
  const scorerCorrect =
    avilesMatch && prediction
      ? isScorerPredictionCorrect(match, prediction, { events: chronicleEvents, squad })
      : false;

  const applyAvilesRules = (next: Prediction): Prediction => {
    const avilesGoals = getAvilesGoalsPick(match, next);
    if (avilesGoals === 0) {
      next.scorer = "nadie";
    } else if (avilesGoals !== undefined) {
      if (next.scorer === "nadie") next.scorer = undefined;
    }

    const outcome = outcomeFromGoalsPicks(next.goalsHome, next.goalsAway);
    if (outcome !== null) next.outcome = outcome;

    return next;
  };

  const update = (patch: Partial<Prediction>) => {
    if (formReadOnly) return;
    const next: Prediction = {
      matchId: match.id,
      matchday: match.matchday,
      outcome: prediction?.outcome,
      goalsHome: prediction?.goalsHome,
      goalsAway: prediction?.goalsAway,
      scorer: prediction?.scorer,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    onChange(avilesMatch ? applyAvilesRules(next) : next);
  };

  const handleAvilesGoalsPick = (isHomeSide: boolean, pick: GoalsPick) => {
    const patch: Partial<Prediction> = isHomeSide ? { goalsHome: pick } : { goalsAway: pick };
    if ((avilesIsHome && isHomeSide) || (!avilesIsHome && !isHomeSide)) {
      patch.scorer = pick === 0 ? "nadie" : undefined;
    }
    update(patch);
  };

  return (
    <>
      <div className="rounded-xl border border-[#214C9B]/20 bg-white p-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.05)] sm:rounded-2xl sm:p-4">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
              <div className="flex min-w-0 items-center gap-1 rounded-lg bg-slate-50 p-1.5 sm:gap-2 sm:rounded-xl sm:bg-transparent sm:p-0">
                <TeamLink gender="masculino" teamId={match.homeTeamId} teamName={homeTeamName} className="shrink-0">
                  <OpponentCrest logo={homeCrest} opponent={homeTeamName} size="sm" className="shrink-0" />
                </TeamLink>
                <TeamLink
                  gender="masculino"
                  teamId={match.homeTeamId}
                  teamName={homeTeamName}
                  className="min-w-0 truncate text-[11px] font-extrabold leading-tight text-slate-800 sm:text-sm"
                >
                  {homeTeamName}
                </TeamLink>
                {avilesMatch && (
                  <GoalsPickButtons
                    value={prediction?.goalsHome}
                    actual={actualGoals.home}
                    mode={displayMode}
                    readOnly={formReadOnly}
                    onPick={(pick) => handleAvilesGoalsPick(true, pick)}
                  />
                )}
              </div>
              <span className="hidden shrink-0 self-center text-xs font-bold uppercase text-slate-400 sm:inline">vs</span>
              <div className="flex min-w-0 items-center gap-1 rounded-lg bg-slate-50 p-1.5 sm:gap-2 sm:rounded-xl sm:bg-transparent sm:p-0">
                <TeamLink gender="masculino" teamId={match.awayTeamId} teamName={awayTeamName} className="shrink-0">
                  <OpponentCrest logo={awayCrest} opponent={awayTeamName} size="sm" className="shrink-0" />
                </TeamLink>
                <TeamLink
                  gender="masculino"
                  teamId={match.awayTeamId}
                  teamName={awayTeamName}
                  className="min-w-0 truncate text-[11px] font-extrabold leading-tight text-slate-800 sm:text-sm"
                >
                  {awayTeamName}
                </TeamLink>
                {avilesMatch && (
                  <GoalsPickButtons
                    value={prediction?.goalsAway}
                    actual={actualGoals.away}
                    mode={displayMode}
                    readOnly={formReadOnly}
                    onPick={(pick) => handleAvilesGoalsPick(false, pick)}
                  />
                )}
              </div>
              {avilesMatch && avilesArticleHref ? (
                <Link
                  href={avilesArticleHref}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#214C9B]/25 px-2.5 py-1.5 text-[11px] font-bold text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 sm:px-3 sm:text-xs"
                >
                  <Eye size={14} /> {avilesArticleLabel}
                </Link>
              ) : !avilesMatch ? (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#214C9B]/25 px-2.5 py-1.5 text-[11px] font-bold text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 sm:px-3 sm:text-xs"
                >
                  <Eye size={14} /> Previa
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="flex w-full items-center gap-2 sm:w-auto" aria-label="Prediccion 1 X 2">
              {outcomes.map((outcome) => {
                const selected = userOutcome === outcome;
                return (
                  <button
                    key={outcome}
                    type="button"
                    disabled={formReadOnly || outcomeLocked}
                    onClick={() => update({ outcome })}
                    className={outcomeButtonClass({
                      mode: displayMode,
                      outcome,
                      userOutcome,
                      actual,
                      selected,
                    })}
                  >
                    {outcome}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {avilesMatch && (
          <ScorerCombobox
            value={scorerLockedToNadie ? "nadie" : prediction?.scorer}
            readOnly={formReadOnly || scorerLockedToNadie}
            options={scorerOptions}
            squad={squad}
            mode={displayMode}
            actualScorer={actualScorer}
            actualScorers={actualScorers}
            isCorrect={scorerCorrect}
            onChange={(scorer) => update({ scorer })}
          />
        )}
      </div>

      <MatchPreviewModal match={match} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}

function resolveScorerPlayer(squad: SquadPlayer[], label: string | undefined): SquadPlayer | undefined {
  if (!label || label === "nadie") return undefined;
  const byName = resolveSquadPlayerByName(squad, label);
  if (byName) return byName;
  return squad.find((player) => scorerLabelForPlayer(player) === label);
}

function ScorerCombobox({
  value,
  readOnly,
  options,
  squad,
  mode,
  actualScorer,
  actualScorers,
  isCorrect,
  onChange,
}: {
  value?: string;
  readOnly?: boolean;
  options: ScorerOption[];
  squad: SquadPlayer[];
  mode: PredictionFormMode;
  actualScorer: string | null;
  actualScorers: string[];
  isCorrect: boolean;
  onChange: (scorer: string) => void;
}) {
  const inputId = useId();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";
  const displayValue = open ? query : selectedLabel;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const inputClassName = cn(
    "min-w-0 flex-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70 sm:px-3 sm:text-sm",
    mode === "results" && actualScorer
      ? "border-[#981915] bg-[#981915]/10 text-[#981915]"
      : mode === "compare" && isCorrect
        ? "border-[#981915] bg-[#214C9B]/10 text-[#214C9B] ring-2 ring-[#981915]/40"
        : mode === "compare" && value && actualScorer && value === actualScorer
          ? "border-[#981915] bg-[#981915]/10 text-[#981915]"
          : mode === "compare" && value
            ? "border-[#214C9B] bg-[#214C9B]/10 text-[#214C9B]"
            : "border-[#214C9B]/20 bg-white text-slate-800 focus:border-[#214C9B]",
  );

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const selectOption = (optionValue: string, optionLabel: string) => {
    onChange(optionValue);
    setQuery(optionLabel);
    setOpen(false);
  };

  const predictedPlayer = resolveScorerPlayer(squad, value);
  const showPredictedFicha = mode === "edit" && predictedPlayer;
  const showUserFichaCompare = mode === "compare" && Boolean(value);
  const actualFichasForDisplay =
    mode === "compare" ? actualScorers.filter((label) => label !== value) : actualScorers;

  return (
    <div
      ref={rootRef}
      className="relative mt-2.5 w-full min-w-0 border-t border-[#214C9B]/10 pt-2.5 sm:mt-3 sm:pt-3"
    >
      <div className="flex w-full min-w-0 flex-row items-center gap-2 sm:max-w-md">
        <label htmlFor={inputId} className="shrink-0 text-xs font-bold text-slate-700 sm:text-sm">
          Goleador:
        </label>
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={readOnly}
          value={displayValue}
          placeholder="Buscar jugador..."
          onFocus={() => {
            if (readOnly) return;
            setOpen(true);
            setQuery(selectedLabel);
          }}
          onChange={(event) => {
            if (readOnly) return;
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
          }}
          className={cn(inputClassName, "min-w-0 flex-1")}
        />
      </div>

      {showPredictedFicha && (
        <div className="mt-2">
          <QuinielaScorerFicha player={predictedPlayer} tone="user" />
        </div>
      )}

      {(showUserFichaCompare || actualFichasForDisplay.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {showUserFichaCompare && (
            <QuinielaScorerFicha
              player={predictedPlayer}
              label={value === "nadie" ? "Nadie" : value}
              tone="user"
              highlight={isCorrect}
            />
          )}
          {actualFichasForDisplay.map((label) => (
            <QuinielaScorerFicha
              key={label}
              player={resolveScorerPlayer(squad, label)}
              label={label === "nadie" ? "Nadie" : label}
              tone="actual"
            />
          ))}
        </div>
      )}

      <ul
        id={listboxId}
        role="listbox"
        hidden={!open || readOnly || filtered.length === 0}
        className="absolute inset-x-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-[#214C9B]/20 bg-white py-1 shadow-lg empty:hidden"
      >
        {filtered.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option.value, option.label)}
              className={`w-full px-3 py-1.5 text-left text-sm font-semibold transition hover:bg-blue-50 ${
                value === option.value ? "bg-blue-50 text-[#214C9B]" : "text-slate-700"
              }`}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuinielaScorerFicha({
  player,
  label,
  tone = "neutral",
  highlight = false,
}: {
  player?: SquadPlayer;
  label?: string;
  tone?: "user" | "actual" | "neutral";
  highlight?: boolean;
}) {
  const displayName = player ? getPlayerDisplayName(player) : label ?? "—";

  const borderClass =
    tone === "user"
      ? "border-[#214C9B]"
      : tone === "actual"
        ? "border-[#981915]"
        : "border-[#214C9B]/40";

  return (
    <article
      className={cn(
        "flex w-[5.5rem] shrink-0 flex-col overflow-hidden rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border-2 bg-gradient-to-b from-sky-100 via-blue-50/90 to-white shadow-[0_4px_12px_rgba(33,76,155,0.12)] sm:w-[6.25rem]",
        borderClass,
        highlight && "ring-2 ring-[#981915] ring-offset-1",
      )}
      aria-label={displayName}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#dff4ff]">
        {player ? (
          <>
            <div className="flex h-full items-end justify-center px-0.5 pb-0 pt-1">
              <PlayerAvatar
                player={player}
                bare
                placeholderTone="light"
                imageClassName="object-cover object-top"
                className="aspect-[3/4] h-[98%] w-[94%] max-w-full drop-shadow-[0_2px_8px_rgba(33,76,155,0.2)]"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-extrabold uppercase leading-tight text-[#214C9B]">
            {displayName}
          </div>
        )}
      </div>
      <div
        className={cn(
          "h-6 shrink-0 px-1 py-1 sm:h-7",
          tone === "actual" ? "bg-[#981915]" : "bg-[#214C9B]",
        )}
      >
        <p className="truncate text-center text-[9px] font-bold leading-tight text-white sm:text-[10px]">
          {displayName}
        </p>
      </div>
    </article>
  );
}

function goalsButtonClass({
  mode,
  option,
  value,
  actual,
}: {
  mode: PredictionFormMode;
  option: GoalsPick;
  value?: GoalsPick;
  actual: GoalsPick | null;
}): string {
  const base =
    "h-7 w-7 rounded-lg border text-[10px] font-extrabold transition disabled:cursor-not-allowed sm:h-9 sm:w-9 sm:rounded-xl sm:text-xs";

  const isUser = value === option;
  const isActual = actual === option;

  if (mode === "results") {
    return `${base} disabled:opacity-100 ${
      isActual
        ? "border-[#981915] bg-[#981915] text-white"
        : "border-[#214C9B]/15 bg-slate-50 text-slate-400"
    }`;
  }

  if (mode === "compare") {
    if (isUser && isActual) {
      return `${base} border-[#981915] bg-[#214C9B] text-white ring-2 ring-[#981915] ring-offset-1 disabled:opacity-100`;
    }
    if (isUser) {
      return `${base} border-[#214C9B] bg-[#214C9B] text-white disabled:opacity-100`;
    }
    if (isActual) {
      return `${base} border-[#981915] bg-[#981915] text-white disabled:opacity-100`;
    }
    return `${base} border-[#214C9B]/15 bg-slate-50 text-slate-400 disabled:opacity-70`;
  }

  return cn(
    base,
    "disabled:opacity-70",
    isUser
      ? "border-[#214C9B] bg-[#214C9B] text-white"
      : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50",
  );
}

function GoalsPickButtons({
  value,
  actual,
  mode = "edit",
  readOnly,
  onPick,
}: {
  value?: GoalsPick;
  actual?: GoalsPick | null;
  mode?: PredictionFormMode;
  readOnly?: boolean;
  onPick: (pick: GoalsPick) => void;
}) {
  const resolvedActual = actual ?? null;

  return (
    <div className="ml-auto grid shrink-0 grid-cols-4 gap-0.5 sm:ml-0 sm:flex sm:gap-1" aria-label="Goles">
      {goalOptions.map((option) => (
        <button
          key={String(option)}
          type="button"
          disabled={readOnly}
          onClick={() => onPick(option)}
          className={goalsButtonClass({ mode, option, value, actual: resolvedActual })}
        >
          {formatGoalsPick(option)}
        </button>
      ))}
    </div>
  );
}
