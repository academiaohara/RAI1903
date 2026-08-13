"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ClasificacionPositionInputProps = {
  position: number;
  max: number;
  disabled?: boolean;
  onCommit: (position: number) => void;
};

export function ClasificacionPositionInput({
  position,
  max,
  disabled,
  onCommit,
}: ClasificacionPositionInputProps) {
  const [draft, setDraft] = useState(String(position));

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(position));
      return;
    }
    const clamped = Math.min(Math.max(parsed, 1), max);
    setDraft(String(clamped));
    if (clamped !== position) onCommit(clamped);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={max}
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      aria-label={`Posición ${position}`}
      className={cn(
        "h-8 w-10 shrink-0 rounded-full border border-[#214C9B]/25 bg-[#214C9B]/10 text-center text-xs font-extrabold text-[#214C9B] tabular-nums",
        "focus:border-[#214C9B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#214C9B]/25",
        "disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:w-11 sm:text-sm",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      )}
    />
  );
}
