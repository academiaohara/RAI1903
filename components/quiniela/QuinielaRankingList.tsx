import type { QuinielaRankingEntry } from "@/lib/quiniela-ranking";

type QuinielaRankingListProps = {
  entries: QuinielaRankingEntry[];
  emptyMessage: string;
  showHits?: boolean;
};

export function QuinielaRankingList({ entries, emptyMessage, showHits = false }: QuinielaRankingListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map((row, index) => (
        <div
          key={row.userId}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#214C9B]/20 bg-white p-4 text-sm"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-xs font-extrabold text-[#214C9B]">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate font-extrabold uppercase text-[#214C9B]">{row.user}</p>
              {showHits && row.hits > 0 && (
                <p className="text-xs font-semibold text-slate-500">{row.hits} aciertos 1-X-2</p>
              )}
            </div>
          </div>
          <span className="shrink-0 font-extrabold text-slate-900">{row.points} pts</span>
        </div>
      ))}
    </div>
  );
}
