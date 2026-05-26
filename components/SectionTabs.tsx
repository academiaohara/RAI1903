"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SectionTab = {
  href: string;
  label: string;
  description?: string;
};

export function SectionTabs({ tabs, className }: { tabs: SectionTab[]; className?: string }) {
  const [activeHref, setActiveHref] = useState(tabs[0]?.href ?? "");

  useEffect(() => {
    const syncHash = () => setActiveHref(window.location.hash || tabs[0]?.href || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [tabs]);

  return (
    <nav className={cn("no-scrollbar flex gap-2 overflow-x-auto rounded-3xl border border-[#981915]/20 bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.06)]", className)} aria-label="Subsecciones">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href as Route} onClick={() => setActiveHref(tab.href)} className={cn("min-w-fit rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition", activeHref === tab.href ? "border-[#981915] bg-[#981915] text-white shadow-md shadow-red-950/10" : "border-[#981915]/15 text-slate-700 hover:border-[#981915] hover:bg-red-50 hover:text-[#981915]")}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
