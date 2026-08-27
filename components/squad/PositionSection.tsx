"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { SquadPosition, SquadSection } from "@/types/squad";
import { SQUAD_POSITION_LABELS, SQUAD_SECTION_LABELS } from "@/types/squad";

export function PositionSection({
  position,
  section,
  children,
  delay = 0,
  variant = "default",
  hideHeadingOnMobile = false,
}: {
  position?: SquadPosition;
  section?: SquadSection;
  children: ReactNode;
  delay?: number;
  variant?: "default" | "fichas";
  hideHeadingOnMobile?: boolean;
}) {
  const isFichas = variant === "fichas";
  const title = section ? SQUAD_SECTION_LABELS[section] : position ? SQUAD_POSITION_LABELS[position] : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className={`${hideHeadingOnMobile ? "hidden md:flex" : ""} ${isFichas ? "space-y-2" : "flex items-end gap-4"}`}>
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#214C9B] sm:text-3xl">
          {title}
        </h2>
        {isFichas ? (
          <div className="h-1 w-full max-w-[12rem] bg-[#214C9B] sm:max-w-[14rem]" />
        ) : (
          <div className="mb-2 h-px flex-1 bg-gradient-to-r from-[#214C9B]/35 via-[#214C9B]/10 to-transparent" />
        )}
      </div>
      {children}
    </motion.section>
  );
}
