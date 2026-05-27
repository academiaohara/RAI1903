"use client";

import { subsectionTabClassName } from "@/components/SubsectionNav";
import { cn } from "@/lib/utils";

type SubsectionFilterNavProps<T extends string> = {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  getLabel?: (item: T) => string;
};

export function SubsectionFilterNav<T extends string>({
  items,
  value,
  onChange,
  className,
  ariaLabel = "Filtros",
  getLabel = (item) => item,
}: SubsectionFilterNavProps<T>) {
  return (
    <nav className={cn("no-scrollbar flex gap-1.5 overflow-x-auto", className)} aria-label={ariaLabel}>
      {items.map((item) => {
        const active = value === item;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item)}
            className={subsectionTabClassName(active)}
          >
            {getLabel(item)}
          </button>
        );
      })}
    </nav>
  );
}
