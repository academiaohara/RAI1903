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
    return "border-amber-400/80 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 hover:from-amber-200 hover:via-yellow-100 hover:to-amber-200";
  }
  if (rank === 2) {
    return "border-slate-400/70 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300";
  }
  if (rank === 3) {
    return "border-orange-400/70 bg-gradient-to-r from-orange-100 via-amber-100/90 to-orange-100 hover:from-orange-200 hover:via-amber-200 hover:to-orange-200";
  }
  return "border-[#214C9B]/20 bg-white hover:border-[#214C9B]/40 hover:bg-blue-50/40";
}

export function getPodiumBadgeClass(rank: number): string {
  if (rank === 1) return "bg-amber-400/50 text-amber-950 ring-1 ring-amber-500/40";
  if (rank === 2) return "bg-slate-300/70 text-slate-800 ring-1 ring-slate-400/40";
  if (rank === 3) return "bg-orange-300/50 text-orange-950 ring-1 ring-orange-400/40";
  return "bg-[#214C9B]/10 text-[#214C9B]";
}

export function getRankingRowClass(rank: number, isCurrentUser: boolean): string {
  return cn(
    "flex w-full items-center justify-between gap-2 rounded-xl border p-2.5 text-xs sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm",
    getPodiumRowClass(rank),
    isCurrentUser && "ring-2 ring-[#214C9B]/50 ring-offset-1",
  );
}
