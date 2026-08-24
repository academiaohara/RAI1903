"use client";

import { useState } from "react";
import { ClasificacionUserModal } from "@/components/clasificacion/ClasificacionUserModal";
import { RankingRow } from "@/components/juegos/RankingRow";
import { YourRankingPosition } from "@/components/juegos/YourRankingPosition";
import { Pagination } from "@/components/Pagination";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { usePagination } from "@/hooks/usePagination";
import type { CompetitionSeasonId } from "@/data/mock";
import type { GameRankingEntry } from "@/lib/game-rankings";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import type { Matchday, Team } from "@/types";

type ClasificacionRankingListProps = {
  entries: GameRankingEntry[];
  emptyMessage: string;
  seasonId: CompetitionSeasonId;
  teams: Team[];
  leagueMatchdays: Matchday[];
  zones: CompetitionZoneRule[];
  seasonLabel: string;
  competitionLabel: string;
  countPoints?: boolean;
};

export function ClasificacionRankingList({
  entries,
  emptyMessage,
  seasonId,
  teams,
  leagueMatchdays,
  zones,
  seasonLabel,
  competitionLabel,
  countPoints = true,
}: ClasificacionRankingListProps) {
  const pagination = usePagination(entries);
  const currentUserId = useCurrentUserId();
  const [selectedUser, setSelectedUser] = useState<GameRankingEntry | null>(null);

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
        <ClasificacionUserModal
          key={selectedUser.userId}
          open
          onClose={() => setSelectedUser(null)}
          seasonId={seasonId}
          userId={selectedUser.userId}
          handle={selectedUser.handle}
          avatarUrl={selectedUser.avatarUrl}
          teams={teams}
          leagueMatchdays={leagueMatchdays}
          zones={zones}
          seasonLabel={seasonLabel}
          competitionLabel={competitionLabel}
        />
      ) : null}
    </>
  );
}
