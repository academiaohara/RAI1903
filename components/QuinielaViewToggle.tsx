"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type QuinielaViewToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly { id: T; label: string }[];
  layoutId?: string;
  className?: string;
};

export function QuinielaViewToggle<T extends string>({
  value,
  onChange,
  options,
  layoutId = "quiniela-view-toggle",
  className,
}: QuinielaViewToggleProps<T>) {
  return (
    <div
      className={cn("relative flex rounded-2xl border border-[#214C9B]/15 bg-slate-100/80 p-1", className)}
      role="tablist"
    >
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition sm:px-4",
              active ? "text-white" : "text-slate-600 hover:text-[#214C9B]",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-[#214C9B] shadow-md shadow-blue-950/20"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 text-center leading-tight">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
