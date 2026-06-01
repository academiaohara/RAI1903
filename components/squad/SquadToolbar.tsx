"use client";

import { motion } from "framer-motion";
import type { SquadViewMode } from "@/types/squad";
import { ViewToggle } from "@/components/squad/ViewToggle";

export function SquadToolbar({
  viewMode,
  onViewModeChange,
  showViewToggle = true,
}: {
  viewMode: SquadViewMode;
  onViewModeChange: (mode: SquadViewMode) => void;
  showViewToggle?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#214C9B] sm:text-2xl">Plantilla oficial</h2>
      {showViewToggle && (
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      )}
    </motion.div>
  );
}
