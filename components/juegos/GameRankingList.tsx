"use client";

import { RankingRow } from "@/components/juegos/RankingRow";
import { YourRankingPosition } from "@/components/juegos/YourRankingPosition";
import { Pagination } from "@/components/Pagination";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { usePagination } from "@/hooks/usePagination";
import type { GameRankingEntry } from "@/lib/game-rankings";

type GameRankingListProps = {
  entries: GameRankingEntry[];
  emptyMessage: string;
  countPoints?: boolean;
};

export function GameRankingList({ entries, emptyMessage, countPoints = true }: GameRankingListProps) {
  const pagination = usePagination(entries);
  const currentUserId = useCurrentUserId();

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  const rankOffset = (pagination.page - 1) * pagination.pageSize;

  return (
    <>
      <YourRankingPosition
        className="mb-3 sm:mb-4"
        entries={entries}
        page={pagination.page}
        pageSize={pagination.pageSize}
        countPoints={countPoints}
      />

      <div className="space-y-1.5 sm:space-y-2">
        {pagination.paginatedItems.map((row, index) => {
          const rank = rankOffset + index + 1;
          return (
            <RankingRow
              key={row.userId}
              rank={rank}
              handle={row.handle}
              avatarUrl={row.avatarUrl}
              points={row.points}
              countPoints={countPoints}
              isCurrentUser={row.userId === currentUserId}
            />
          );
        })}
      </div>

      <Pagination
        className="mt-3 sm:mt-4"
        pageSizeLabel="Participantes por página"
        pageSize={pagination.pageSize}
        pageSizes={pagination.pageSizes}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        canGoFirst={pagination.canGoFirst}
        canGoPrevious={pagination.canGoPrevious}
        canGoNext={pagination.canGoNext}
        canGoLast={pagination.canGoLast}
        onPageSizeChange={pagination.setPageSize}
        onFirst={pagination.goToFirst}
        onPrevious={pagination.goToPrevious}
        onNext={pagination.goToNext}
        onLast={pagination.goToLast}
      />
    </>
  );
}
