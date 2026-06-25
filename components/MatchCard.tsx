"use client";

import { Badge } from "@/components/Badge";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { MatchFixtureJerseyMobile } from "@/components/MatchFixtureJerseyMobile";
import { MatchFixtureTeamLinks } from "@/components/MatchFixtureTeamLinks";
import { MatchFixtureWideScoreRow } from "@/components/MatchFixtureWideScoreRow";
import { RAI_TEAM_ID } from "@/data/mock";
import { matchCompetitionShortLabel, matchFixtureMeta, matchRoundBadgeLabel } from "@/lib/competition-labels";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { matchResultOverrideKey, readMatchResultOverride } from "@/lib/fixture-inline-keys";
import { matchFixtureCardClassName, matchFixtureCardMobileWidthClassName } from "@/lib/match-card-styles";
import { cn, formatMatchDate, formatMatchTime } from "@/lib/utils";
import type { Match } from "@/types";

type MatchCardLayout = "compact" | "stripe";

export function MatchCard({
  match,
  compact = false,
  highlightTeamId = RAI_TEAM_ID,
  gender = "masculino",
  layout = "compact",
}: {
  match: Match;
  compact?: boolean;
  highlightTeamId?: string;
  gender?: PrimerEquipoGender;
  layout?: MatchCardLayout;
}) {
  const { editMode, getOverride, mergeSaveValue } = useInlineEditing();
  const override = readMatchResultOverride<Partial<Match>>(getOverride, gender, match.id) ?? {};
  const editedMatch = { ...match, ...override };
  const scoreLabel =
    editedMatch.status === "finished"
      ? `${editedMatch.homeScore} - ${editedMatch.awayScore}`
      : layout === "stripe"
        ? formatMatchTime(editedMatch.date)
        : "vs";
  const stripeDateLabel =
    editedMatch.status === "scheduled" ? formatMatchDate(editedMatch.date) : undefined;
  const roundLabel = matchRoundBadgeLabel(editedMatch) ?? matchCompetitionShortLabel(editedMatch);
  const savePatch = (patch: Partial<Match>) => {
    mergeSaveValue(matchResultOverrideKey(gender, match.id), patch);
  };

  return (
    <article className={cn(matchFixtureCardClassName, layout === "stripe" && "pb-2 sm:pb-3")}>
      <div
        className={cn(
          "mb-0.5 flex items-start justify-between gap-1 sm:mb-1 sm:gap-2",
          layout === "stripe" && "px-2 pt-2 sm:px-3 sm:pt-3",
        )}
      >
        <Badge tone={editedMatch.status === "finished" ? "slate" : "blue"} className="text-[9px] sm:text-[10px]">
          {editedMatch.status === "finished" ? "Finalizado" : "Programado"}
        </Badge>
        <span className="flex shrink-0 items-center justify-end gap-1 text-right text-[9px] font-bold uppercase leading-tight tracking-[0.04em] text-[#981915] sm:gap-1.5 sm:text-[11px] sm:tracking-[0.06em]">
          <CompetitionLogo competition={editedMatch.competition} alt={matchCompetitionShortLabel(editedMatch)} size="xs" />
          {matchFixtureMeta(editedMatch)}
        </span>
      </div>
      {layout === "stripe" ? (
        <>
          <div className="sm:hidden">
            <MatchFixtureJerseyMobile
              match={editedMatch}
              gender={gender}
              scoreLabel={scoreLabel}
              roundLabel={roundLabel}
              dateLabel={stripeDateLabel}
              className={matchFixtureCardMobileWidthClassName}
            />
          </div>
          <MatchFixtureWideScoreRow
            match={editedMatch}
            gender={gender}
            highlightTeamId={highlightTeamId}
            scoreLabel={scoreLabel}
            sublabel={stripeDateLabel}
            linkTeams
            className="hidden sm:grid"
          />
        </>
      ) : (
        <MatchFixtureTeamLinks
          match={editedMatch}
          gender={gender}
          highlightTeamId={highlightTeamId}
          scoreLabel={scoreLabel}
        />
      )}
      {editMode && (
        <div className="mt-3 grid gap-2 rounded-2xl border border-[#214C9B]/15 bg-blue-50/60 p-3 sm:grid-cols-[9rem_1fr]">
          <select
            value={editedMatch.status}
            onChange={(event) => savePatch({ status: event.target.value as Match["status"] })}
            className="rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
            aria-label="Editar estado del partido"
          >
            <option value="scheduled">Programado</option>
            <option value="finished">Finalizado</option>
          </select>
          {editedMatch.status === "finished" ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editedMatch.homeScore ?? 0}
                onChange={(event) => savePatch({ homeScore: Number(event.target.value) })}
                className="w-16 rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-center text-sm font-extrabold text-[#214C9B]"
                aria-label="Goles local"
              />
              <span className="text-xs font-extrabold text-slate-400">-</span>
              <input
                type="number"
                value={editedMatch.awayScore ?? 0}
                onChange={(event) => savePatch({ awayScore: Number(event.target.value) })}
                className="w-16 rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-center text-sm font-extrabold text-[#214C9B]"
                aria-label="Goles visitante"
              />
            </div>
          ) : (
            <input
              type="datetime-local"
              value={editedMatch.date.slice(0, 16)}
              onChange={(event) => savePatch({ date: event.target.value })}
              className="rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-sm font-bold text-[#214C9B]"
              aria-label="Fecha del partido"
            />
          )}
        </div>
      )}
      {compact ? (
        editedMatch.status === "scheduled" && (
          <p className="mt-2 text-xs font-bold text-slate-600">{formatMatchDate(editedMatch.date)}</p>
        )
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>{formatMatchDate(editedMatch.date)}</span>
          <span>{editedMatch.venue}</span>
        </div>
      )}
    </article>
  );
}
