"use client";

import type { ReactNode } from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

type PaginationProps = {
  pageSize: number;
  pageSizes: readonly number[];
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  canGoFirst: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  canGoLast: boolean;
  onPageSizeChange: (size: number) => void;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  className?: string;
  /** Etiqueta del selector de tamaño (por defecto: "Noticias por página") */
  pageSizeLabel?: string;
};

function NavIconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
    >
      {children}
    </button>
  );
}

export function Pagination({
  pageSize,
  pageSizes,
  totalItems,
  rangeStart,
  rangeEnd,
  canGoFirst,
  canGoPrevious,
  canGoNext,
  canGoLast,
  onPageSizeChange,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  className,
  pageSizeLabel = "Noticias por página",
}: PaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Paginación"
      className={`flex flex-wrap items-center justify-end gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 ${className ?? ""}`}
    >
      <label className="flex items-center gap-2">
        <span className="whitespace-nowrap text-slate-600">{pageSizeLabel}:</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-800 outline-none focus:border-[#214C9B] focus:ring-1 focus:ring-[#214C9B]/30"
          aria-label="Noticias por página"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <p className="whitespace-nowrap tabular-nums text-slate-600" aria-live="polite">
        {rangeStart} – {rangeEnd} de {totalItems}
      </p>

      <div className="flex items-center">
        <NavIconButton label="Primera página" disabled={!canGoFirst} onClick={onFirst}>
          <ChevronsLeft size={18} aria-hidden />
        </NavIconButton>
        <NavIconButton label="Página anterior" disabled={!canGoPrevious} onClick={onPrevious}>
          <ChevronLeft size={18} aria-hidden />
        </NavIconButton>
        <NavIconButton label="Página siguiente" disabled={!canGoNext} onClick={onNext}>
          <ChevronRight size={18} aria-hidden />
        </NavIconButton>
        <NavIconButton label="Última página" disabled={!canGoLast} onClick={onLast}>
          <ChevronsRight size={18} aria-hidden />
        </NavIconButton>
      </div>
    </nav>
  );
}
