import type { QuinielaRankingEntry } from "@/lib/quiniela-ranking";

type QuinielaRankingListProps = {
  entries: QuinielaRankingEntry[];
  emptyMessage: string;
};

export function QuinielaRankingList({ entries, emptyMessage }: QuinielaRankingListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {entries.map((row, index) => (
        <div
          key={row.userId}
          className="flex items-center justify-between gap-2 rounded-xl border border-[#214C9B]/20 bg-white p-2.5 text-xs sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm"
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-[11px] font-extrabold text-[#214C9B] sm:h-8 sm:w-8 sm:text-xs">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate font-extrabold uppercase text-[#214C9B]">{row.user}</p>
            </div>
          </div>
          <span className="shrink-0 font-extrabold text-slate-900">{row.points} pts</span>
        </div>
      ))}
    </div>
  );
}
