"use client";

import { SeasonSelector } from "@/components/SeasonSelector";
import { cn } from "@/lib/utils";

type CanteraContextBarProps = {
  showSeasonSelector?: boolean;
  className?: string;
};

export function CanteraContextBar({ showSeasonSelector = false, className }: CanteraContextBarProps) {
  if (!showSeasonSelector) return null;

  return (
    <section aria-label="Contexto de cantera" className={cn("flex justify-end", className)}>
      <SeasonSelector className="border-[#214C9B]/15 bg-[#214C9B]/5 shrink-0" />
    </section>
  );
}
