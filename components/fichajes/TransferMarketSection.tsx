"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type TransferMarketSectionProps = {
  title: string;
  children: ReactNode;
  delay?: number;
};

export function TransferMarketSection({ title, children, delay = 0 }: TransferMarketSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#214C9B] sm:text-3xl">{title}</h2>
        <div className="h-1 w-full max-w-[12rem] bg-[#214C9B] sm:max-w-[14rem]" />
      </div>
      {children}
    </motion.section>
  );
}
