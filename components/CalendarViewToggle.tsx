"use client";

import { CalendarDays, List } from "lucide-react";
import { motion } from "framer-motion";
import type { CalendarViewMode } from "@/types";

const OPTIONS: Array<{ id: CalendarViewMode; label: string; icon: typeof List }> = [
  { id: "mes", label: "Mes", icon: CalendarDays },
  { id: "lista", label: "Lista", icon: List },
];

export function CalendarViewToggle({ value, onChange }: { value: CalendarViewMode; onChange: (mode: CalendarViewMode) => void }) {
  return (
    <div className="relative flex rounded-2xl border border-[#214C9B]/15 bg-slate-100/80 p-1" role="group" aria-label="Modo de vista del calendario">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
              active ? "text-white" : "text-slate-600 hover:text-[#214C9B]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="calendar-view-toggle"
                className="absolute inset-0 rounded-xl bg-[#214C9B] shadow-md shadow-blue-950/20"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <Icon size={16} className="relative z-10" aria-hidden />
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
