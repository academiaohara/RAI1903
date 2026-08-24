"use client";

import { useState } from "react";
import { RankingRow } from "@/components/juegos/RankingRow";
import { YourRankingPosition } from "@/components/juegos/YourRankingPosition";
import { Pagination } from "@/components/Pagination";
import { QuinielaUserModal } from "@/components/quiniela/QuinielaUserModal";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { usePagination } from "@/hooks/usePagination";
import type { CompetitionSeasonId } from "@/data/mock";
import type { QuinielaRankingEntry } from "@/lib/quiniela-ranking";
import type { Matchday, Team } from "@/types";

type QuinielaRankingListProps = {
  entries: QuinielaRankingEntry[];
  emptyMessage: string;
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  teams: Team[];
  seasonLabel: string;
  competitionLabel: string;
  totalRounds: number;
  currentRound: number;
  initialModalRound?: number;
  countPoints?: boolean;
};

export function QuinielaRankingList({
  entries,
  emptyMessage,
  seasonId,
  matchdays,
  teams,
  seasonLabel,
  competitionLabel,
  totalRounds,
  currentRound,
  initialModalRound,
  countPoints = true,
}: QuinielaRankingListProps) {
  const pagination = usePagination(entries);
  const currentUserId = useCurrentUserId();
  const [selectedUser, setSelectedUser] = useState<QuinielaRankingEntry | null>(null);

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
        onSelect={(entry) => {
          const full = entries.find((row) => row.userId === entry.userId);
          if (full) setSelectedUser(full);
        }}
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
              onClick={() => setSelectedUser(row)}
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
          teams={teams}
          seasonLabel={seasonLabel}
          competitionLabel={competitionLabel}
          totalRounds={totalRounds}
          currentRound={currentRound}
          initialRound={initialModalRound}
        />
      ) : null}
    </>
  );
}
