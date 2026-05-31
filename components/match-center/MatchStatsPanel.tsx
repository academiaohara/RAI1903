"use client";

import type { ReactNode } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { MatchStatBarRow } from "@/components/match-center/match-stats-ui";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import type { MatchStatCategory, MatchStatRow } from "@/types";

function CategorySection({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="border-t border-[#eeeeee] bg-[#fafafa] px-4 py-2 first:border-t-0">
        <p className="text-center text-[11px] font-bold uppercase tracking-wide text-[#333333]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function renderCategoryRows(rows: MatchStatRow[], editMode: boolean, categoryIndex: number, updateRow: (ci: number, ri: number, patch: Partial<MatchStatRow>) => void) {
  const elements: ReactNode[] = [];
  let rowIndex = 0;

  while (rowIndex < rows.length) {
    const row = rows[rowIndex]!;

    if (editMode) {
      elements.push(
        <div
          key={`${row.label}-${rowIndex}`}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-[#eeeeee] px-4 py-3 text-sm"
        >
          <input
            value={String(row.home)}
            onChange={(event) => updateRow(categoryIndex, rowIndex, { home: event.target.value })}
            aria-label={`${row.label} local`}
            className="rounded-lg border border-[#214C9B]/25 px-2 py-1 text-right text-sm font-semibold tabular-nums outline-none focus:border-[#214C9B]"
          />
          <input
            value={row.label}
            onChange={(event) => updateRow(categoryIndex, rowIndex, { label: event.target.value })}
            aria-label="Etiqueta de estadistica"
            className="w-full min-w-[6rem] rounded-lg border border-[#214C9B]/25 px-2 py-1 text-center text-xs font-medium outline-none focus:border-[#214C9B]"
          />
          <input
            value={String(row.away)}
            onChange={(event) => updateRow(categoryIndex, rowIndex, { away: event.target.value })}
            aria-label={`${row.label} visitante`}
            className="rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-semibold tabular-nums outline-none focus:border-[#214C9B]"
          />
        </div>,
      );
    } else {
      elements.push(<MatchStatBarRow key={`${row.label}-${rowIndex}`} row={row} />);
    }

    rowIndex += 1;
  }

  return elements;
}

export function MatchStatsPanel({
  matchId,
  categories,
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
    <section>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#333333]">Estadísticas del partido</h2>
      {currentCategories.length === 0 && !editMode ? (
        <p className="text-sm text-slate-500">No hay estadísticas registradas para este partido.</p>
      ) : (
      <div className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
        {currentCategories.map((category, categoryIndex) => (
          <CategorySection
            key={`${category.title}-${categoryIndex}`}
            title={
              editMode ? (
                <input
                  value={category.title}
                  onChange={(event) => updateCategoryTitle(categoryIndex, event.target.value)}
                  aria-label="Editar titulo de categoria de estadisticas"
                  className="w-full rounded border border-[#214C9B]/25 bg-white px-2 py-1 text-center text-[11px] font-bold uppercase outline-none focus:border-[#214C9B]"
                />
              ) : (
                category.title
              )
            }
          >
            {renderCategoryRows(category.rows, editMode, categoryIndex, updateRow)}
          </CategorySection>
        ))}
      </div>
      )}
    </section>
  );
}
