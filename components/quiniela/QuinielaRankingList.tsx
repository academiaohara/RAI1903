"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Pagination } from "@/components/Pagination";
import { QuinielaUserModal } from "@/components/quiniela/QuinielaUserModal";
import { usePagination } from "@/hooks/usePagination";
import type { CompetitionSeasonId } from "@/data/mock";
import type { QuinielaRankingEntry } from "@/lib/quiniela-ranking";
import type { Matchday } from "@/types";

type QuinielaRankingListProps = {
  entries: QuinielaRankingEntry[];
  emptyMessage: string;
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  totalRounds: number;
  currentRound: number;
  initialModalRound?: number;
};

export function QuinielaRankingList({
  entries,
  emptyMessage,
  seasonId,
  matchdays,
  totalRounds,
  currentRound,
  initialModalRound,
}: QuinielaRankingListProps) {
  const pagination = usePagination(entries);
  const [selectedUser, setSelectedUser] = useState<QuinielaRankingEntry | null>(null);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  const rankOffset = (pagination.page - 1) * pagination.pageSize;

  return (
    <>
      <div className="space-y-1.5 sm:space-y-2">
        {pagination.paginatedItems.map((row, index) => (
          <button
            key={row.userId}
            type="button"
            onClick={() => setSelectedUser(row)}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#214C9B]/20 bg-white p-2.5 text-left text-xs transition hover:border-[#214C9B]/40 hover:bg-blue-50/40 sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm"
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-[11px] font-extrabold text-[#214C9B] sm:h-8 sm:w-8 sm:text-xs">
                {rankOffset + index + 1}
              </span>
              <UserAvatar avatarUrl={row.avatarUrl} label={row.handle} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-extrabold text-[#214C9B]">{row.handle}</p>
              </div>
            </div>
            <span className="shrink-0 font-extrabold text-slate-900">{row.points} pts</span>
          </button>
        ))}
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

      {selectedUser ? (
        <QuinielaUserModal
          key={`${selectedUser.userId}-${initialModalRound ?? "latest"}`}
          open
          onClose={() => setSelectedUser(null)}
          seasonId={seasonId}
          userId={selectedUser.userId}
          handle={selectedUser.handle}
          avatarUrl={selectedUser.avatarUrl}
          matchdays={matchdays}
          totalRounds={totalRounds}
          currentRound={currentRound}
          initialRound={initialModalRound}
        />
      ) : null}
    </>
  );
}
