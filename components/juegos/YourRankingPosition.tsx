"use client";

import { UserAvatar } from "@/components/auth/UserAvatar";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import {
  findUserRankingPosition,
  getPodiumRowClass,
  isRankOnPage,
  type RankingListEntry,
} from "@/lib/ranking-display";
import { cn } from "@/lib/utils";

type YourRankingPositionProps = {
  entries: RankingListEntry[];
  page: number;
  pageSize: number;
  countPoints: boolean;
  onSelect?: (entry: RankingListEntry) => void;
  className?: string;
};

export function YourRankingPosition({
  entries,
  page,
  pageSize,
  countPoints,
  onSelect,
  className,
}: YourRankingPositionProps) {
  const userId = useCurrentUserId();

  if (userId === undefined || entries.length === 0) return null;

  if (!userId) {
    return (
      <p className={cn("rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600", className)}>
        Inicia sesión para ver tu posición en el ranking.
      </p>
    );
  }

  const position = findUserRankingPosition(entries, userId);

  if (!position) {
    return (
      <p className={cn("rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600", className)}>
        Aún no apareces en este ranking. Guarda tu boleto en pronósticos para participar.
      </p>
    );
  }

  const { rank, entry } = position;
  const onCurrentPage = isRankOnPage(rank, page, pageSize);
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(entry) : undefined}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border p-2.5 text-left text-xs sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm",
        getPodiumRowClass(rank),
        "ring-2 ring-[#214C9B]/40 ring-offset-1",
        onSelect && "cursor-pointer transition hover:brightness-[0.98]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B]/80 sm:text-[11px]">
          Tu posición
        </p>
        <div className="mt-1 flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/15 text-[11px] font-extrabold text-[#214C9B] sm:h-8 sm:w-8 sm:text-xs">
            {rank}
          </span>
          <UserAvatar avatarUrl={entry.avatarUrl} label={entry.handle} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-[#214C9B]">{entry.handle}</p>
            {entry.roundsPlayed !== undefined ? (
              <p className="text-[10px] text-slate-500 sm:text-xs">{entry.roundsPlayed} jornadas</p>
            ) : onCurrentPage ? (
              <p className="text-[10px] text-slate-500 sm:text-xs">También en la lista de abajo</p>
            ) : null}
          </div>
        </div>
      </div>
      <span className="shrink-0 font-extrabold text-slate-900">
        {countPoints ? `${entry.points} pts` : "—"}
      </span>
    </Wrapper>
  );
}
