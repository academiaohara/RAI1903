"use client";

import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";
import type { SquadViewMode } from "@/types/squad";

export function ViewToggle({ value, onChange }: { value: SquadViewMode; onChange: (mode: SquadViewMode) => void }) {
  const options: Array<{ id: SquadViewMode; label: string; icon: typeof List }> = [
    { id: "lista", label: "Lista", icon: List },
    { id: "fichas", label: "Fichas", icon: LayoutGrid },
  ];

  return (
    <div className="relative flex w-full rounded-2xl border border-[#214C9B]/15 bg-slate-100/80 p-1 sm:w-auto">
      {options.map((option) => {
        const active = value === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs ${
              active ? "text-white" : "text-slate-600 hover:text-[#214C9B]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="squad-view-toggle"
                className="absolute inset-0 rounded-xl bg-[#214C9B] shadow-md shadow-blue-950/20"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <Icon size={15} className="relative z-10" />
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
