"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { MatchStatBarRow } from "@/components/match-center/match-stats-ui";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import { MatchJsonPasteSection } from "@/components/match-center/MatchJsonPasteSection";
import { parseMatchStatsJson } from "@/lib/match-center/parse-match-json";
import { buildStandardMatchStatCategory } from "@/lib/match-stats-defaults";
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
        <div className="text-center text-[11px] font-bold uppercase tracking-wide text-[#333333]">{title}</div>
      </div>
      {children}
    </div>
  );
}

function emptyStatRow(): MatchStatRow {
  return { label: "", home: 0, away: 0 };
}

function renderCategoryRows(
  rows: MatchStatRow[],
  editMode: boolean,
  categoryIndex: number,
  updateRow: (ci: number, ri: number, patch: Partial<MatchStatRow>) => void,
  removeRow: (ci: number, ri: number) => void,
) {
  const elements: ReactNode[] = [];
  let rowIndex = 0;

  while (rowIndex < rows.length) {
    const row = rows[rowIndex]!;

    if (editMode) {
      elements.push(
        <div
          key={`row-${categoryIndex}-${rowIndex}`}
          className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2 border-t border-[#eeeeee] px-4 py-3 text-sm sm:grid-cols-[auto_1fr_auto_1fr]"
        >
          <button
            type="button"
            onClick={() => removeRow(categoryIndex, rowIndex)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#981915]/20 text-[#981915] hover:bg-red-50"
            aria-label="Eliminar estadística"
          >
            <Trash2 size={14} />
          </button>
          <input
            type="text"
            value={String(row.home)}
            onChange={(event) => updateRow(categoryIndex, rowIndex, { home: event.target.value })}
            aria-label={`${row.label || "Estadística"} local`}
            className="rounded-lg border border-[#214C9B]/25 px-2 py-1 text-right text-sm font-semibold tabular-nums outline-none focus:border-[#214C9B]"
          />
          <input
            type="text"
            value={row.label}
            onChange={(event) => updateRow(categoryIndex, rowIndex, { label: event.target.value })}
            aria-label="Etiqueta de estadistica"
            className="w-full min-w-[6rem] rounded-lg border border-[#214C9B]/25 px-2 py-1 text-center text-xs font-medium outline-none focus:border-[#214C9B]"
          />
          <input
            type="text"
            value={String(row.away)}
            onChange={(event) => updateRow(categoryIndex, rowIndex, { away: event.target.value })}
            aria-label={`${row.label || "Estadística"} visitante`}
            className="rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-semibold tabular-nums outline-none focus:border-[#214C9B]"
          />
        </div>,
      );
    } else {
      elements.push(<MatchStatBarRow key={`row-${categoryIndex}-${rowIndex}`} row={row} />);
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

  const addCategory = () => {
    updateCategories([...currentCategories, { title: "Estadísticas", rows: [emptyStatRow()] }]);
  };

  const addStandardStats = () => {
    if (currentCategories.length === 0) {
      updateCategories([buildStandardMatchStatCategory()]);
      return;
    }
    const next = [...currentCategories];
    const last = next[next.length - 1]!;
    next[next.length - 1] = {
      ...last,
      rows: [...last.rows, ...buildStandardMatchStatCategory().rows],
    };
    updateCategories(next);
  };

  const addRow = (categoryIndex: number) => {
    updateCategories(
      currentCategories.map((category, index) =>
        index === categoryIndex ? { ...category, rows: [...category.rows, emptyStatRow()] } : category,
      ),
    );
  };

  const removeRow = (categoryIndex: number, rowIndex: number) => {
    const next = currentCategories
      .map((category, cIndex) => {
        if (cIndex !== categoryIndex) return category;
        return { ...category, rows: category.rows.filter((_, rIndex) => rIndex !== rowIndex) };
      })
      .filter((category) => category.rows.length > 0);
    updateCategories(next);
  };

  const removeCategory = (categoryIndex: number) => {
    updateCategories(currentCategories.filter((_, index) => index !== categoryIndex));
  };

  return (
    <section>
      {editMode && (
        <div className="mb-4">
          <MatchJsonPasteSection
            title="Importar estadísticas JSON"
            hint='Categorías con filas, solo filas sueltas, o { "rows": [ … ] }. Campos: label/etiqueta, home/local, away/visitante.'
            applyLabel="Aplicar estadísticas"
            placeholder={`[
  {
    "title": "Estadísticas",
    "rows": [
      { "label": "Posesión", "home": "55%", "away": "45%" },
      { "label": "Disparos", "home": 12, "away": 8 }
    ]
  }
]`}
            parse={parseMatchStatsJson}
            onImport={(data) => updateCategories(data)}
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#333333]">Estadísticas del partido</h2>
        {editMode && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addStandardStats}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              <Plus size={14} aria-hidden />
              Estadísticas habituales
            </button>
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              <Plus size={14} aria-hidden />
              Nueva categoría
            </button>
          </div>
        )}
      </div>

      {currentCategories.length === 0 && !editMode ? (
        <p className="text-sm text-slate-500">No hay estadísticas registradas para este partido.</p>
      ) : currentCategories.length === 0 && editMode ? (
        <p className="rounded-2xl border border-dashed border-[#214C9B]/25 bg-blue-50/40 p-4 text-sm text-slate-600">
          Pulsa «Estadísticas habituales» para añadir posesión, disparos, disparos a puerta y el resto de métricas
          típicas, o «Nueva categoría» para empezar desde cero.
        </p>
      ) : (
        <div className="space-y-4">
          {currentCategories.map((category, categoryIndex) => (
            <div key={`category-${categoryIndex}`} className="space-y-2">
              {editMode && currentCategories.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeCategory(categoryIndex)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-2.5 py-1 text-[10px] font-extrabold uppercase text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={12} aria-hidden />
                    Quitar categoría
                  </button>
                </div>
              )}
              <div className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
                <CategorySection
                  title={
                    editMode ? (
                      <input
                        type="text"
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
                  {renderCategoryRows(category.rows, editMode, categoryIndex, updateRow, removeRow)}
                </CategorySection>
              </div>
              {editMode && (
                <button
                  type="button"
                  onClick={() => addRow(categoryIndex)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-1.5 text-xs font-bold uppercase text-[#214C9B] hover:bg-blue-50"
                >
                  <Plus size={14} aria-hidden />
                  Añadir fila
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
