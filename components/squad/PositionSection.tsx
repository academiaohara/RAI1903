"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { SquadPosition } from "@/types/squad";
import { SQUAD_POSITION_LABELS } from "@/types/squad";

export function PositionSection({
  position,
  children,
  delay = 0,
}: {
  position: SquadPosition;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex items-end gap-4">
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#214C9B] sm:text-3xl">
          {SQUAD_POSITION_LABELS[position]}
        </h2>
        <div className="mb-2 h-px flex-1 bg-gradient-to-r from-[#214C9B]/35 via-[#214C9B]/10 to-transparent" />
      </div>
      {children}
    </motion.section>
  );
}
