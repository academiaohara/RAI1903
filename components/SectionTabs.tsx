import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export type SectionTab = {
  href: string;
  label: string;
  description?: string;
};

export function SectionTabs({ tabs, className }: { tabs: SectionTab[]; className?: string }) {
  return (
    <nav className={cn("no-scrollbar flex gap-2 overflow-x-auto rounded-3xl border border-[#981915]/20 bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.06)]", className)} aria-label="Subsecciones">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href as Route} className="min-w-fit rounded-2xl border border-[#981915]/15 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-700 transition hover:border-[#981915] hover:bg-red-50 hover:text-[#981915]">
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
