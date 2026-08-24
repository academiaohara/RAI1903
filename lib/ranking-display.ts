import { cn } from "@/lib/utils";

export type RankingListEntry = {
  userId: string;
  handle: string;
  avatarUrl: string | null;
  points: number;
  roundsPlayed?: number;
};

export function findUserRankingPosition<T extends RankingListEntry>(
  entries: T[],
  userId: string | null | undefined,
): { rank: number; entry: T } | null {
  if (!userId) return null;
  const index = entries.findIndex((entry) => entry.userId === userId);
  if (index < 0) return null;
  return { rank: index + 1, entry: entries[index] };
}

export function isRankOnPage(rank: number, page: number, pageSize: number): boolean {
  const start = (page - 1) * pageSize + 1;
  const end = page * pageSize;
  return rank >= start && rank <= end;
}

export function getPodiumRowClass(rank: number): string {
  if (rank === 1) {
    return "border-amber-300/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 hover:from-amber-100 hover:via-yellow-100 hover:to-amber-100";
  }
  if (rank === 2) {
    return "border-slate-300/80 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 hover:from-slate-200 hover:via-slate-100 hover:to-slate-200";
  }
  if (rank === 3) {
    return "border-orange-300/60 bg-gradient-to-r from-orange-50 via-amber-50/80 to-orange-50 hover:from-orange-100 hover:via-amber-100 hover:to-orange-100";
  }
  return "border-[#214C9B]/20 bg-white hover:border-[#214C9B]/40 hover:bg-blue-50/40";
}

export function getPodiumBadgeClass(rank: number): string {
  if (rank === 1) return "bg-amber-400/30 text-amber-950";
  if (rank === 2) return "bg-slate-300/50 text-slate-800";
  if (rank === 3) return "bg-orange-300/35 text-orange-950";
  return "bg-[#214C9B]/10 text-[#214C9B]";
}

export function getRankingRowClass(rank: number, isCurrentUser: boolean): string {
  return cn(
    "flex w-full items-center justify-between gap-2 rounded-xl border p-2.5 text-xs sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm",
    getPodiumRowClass(rank),
    isCurrentUser && "ring-2 ring-[#214C9B]/50 ring-offset-1",
  );
}
