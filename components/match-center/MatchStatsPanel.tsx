import type { MatchStatCategory } from "@/types";

export function MatchStatsPanel({ categories, homeLabel, awayLabel }: { categories: MatchStatCategory[]; homeLabel: string; awayLabel: string }) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Stats del partido</h2>
      <div className="overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white">
        {categories.map((category) => (
          <div key={category.title}>
            <div className="bg-slate-100 px-4 py-2">
              <p className="text-xs font-extrabold uppercase tracking-normal text-slate-600">{category.title}</p>
            </div>
            {category.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm"
              >
                <p className="text-right font-extrabold tabular-nums text-[#214C9B]">{row.home}</p>
                <p className="text-center text-xs font-bold uppercase text-slate-500">{row.label}</p>
                <p className="font-extrabold tabular-nums text-slate-800">{row.away}</p>
              </div>
            ))}
          </div>
        ))}
        <p className="border-t border-slate-100 px-4 py-2 text-center text-[10px] font-bold uppercase text-slate-400">
          {homeLabel} · {awayLabel}
        </p>
      </div>
    </section>
  );
}
