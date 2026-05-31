"use client";

import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import type { MatchStatCategory, MatchStatRow } from "@/types";

export function MatchStatsPanel({
  matchId,
  categories,
  homeLabel,
  awayLabel,
}: {
  matchId: string;
  categories: MatchStatCategory[];
  homeLabel: string;
  awayLabel: string;
}) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const keys = useMatchDetailStorageKeys(matchId);
  const currentCategories = getValue(keys.stats, categories);

  const updateCategories = (next: MatchStatCategory[]) => {
    saveValue(keys.stats, next);
  };

  const updateRow = (categoryIndex: number, rowIndex: number, patch: Partial<MatchStatRow>) => {
    const next = currentCategories.map((category, cIndex) => {
      if (cIndex !== categoryIndex) return category;
      return {
        ...category,
        rows: category.rows.map((row, rIndex) => (rIndex === rowIndex ? { ...row, ...patch } : row)),
      };
    });
    updateCategories(next);
  };

  const updateCategoryTitle = (categoryIndex: number, title: string) => {
    updateCategories(currentCategories.map((category, index) => (index === categoryIndex ? { ...category, title } : category)));
  };

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Stats del partido</h2>
      <div className="overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white">
        {currentCategories.map((category, categoryIndex) => (
          <div key={`${category.title}-${categoryIndex}`}>
            <div className="bg-slate-100 px-4 py-2">
              {editMode ? (
                <input
                  value={category.title}
                  onChange={(event) => updateCategoryTitle(categoryIndex, event.target.value)}
                  aria-label="Editar titulo de categoria de estadisticas"
                  className="w-full rounded-lg border border-[#214C9B]/25 bg-white px-2 py-1 text-xs font-extrabold uppercase text-slate-600 outline-none focus:border-[#214C9B]"
                />
              ) : (
                <p className="text-xs font-extrabold uppercase tracking-normal text-slate-600">{category.title}</p>
              )}
            </div>
            {category.rows.map((row, rowIndex) => (
              <div
                key={`${row.label}-${rowIndex}`}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm"
              >
                {editMode ? (
                  <>
                    <input
                      value={String(row.home)}
                      onChange={(event) => updateRow(categoryIndex, rowIndex, { home: event.target.value })}
                      aria-label={`${row.label} local`}
                      className="rounded-lg border border-[#214C9B]/25 px-2 py-1 text-right text-sm font-extrabold tabular-nums text-[#214C9B] outline-none focus:border-[#214C9B]"
                    />
                    <input
                      value={row.label}
                      onChange={(event) => updateRow(categoryIndex, rowIndex, { label: event.target.value })}
                      aria-label="Etiqueta de estadistica"
                      className="w-full min-w-[6rem] rounded-lg border border-[#214C9B]/25 px-2 py-1 text-center text-xs font-bold uppercase text-slate-500 outline-none focus:border-[#214C9B]"
                    />
                    <input
                      value={String(row.away)}
                      onChange={(event) => updateRow(categoryIndex, rowIndex, { away: event.target.value })}
                      aria-label={`${row.label} visitante`}
                      className="rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-extrabold tabular-nums text-slate-800 outline-none focus:border-[#214C9B]"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-right font-extrabold tabular-nums text-[#214C9B]">{row.home}</p>
                    <p className="text-center text-xs font-bold uppercase text-slate-500">{row.label}</p>
                    <p className="font-extrabold tabular-nums text-slate-800">{row.away}</p>
                  </>
                )}
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
