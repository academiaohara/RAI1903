"use client";

import { SectionTabs } from "@/components/SectionTabs";
import { SeasonSelector } from "@/components/SeasonSelector";
import { QUINIELA_TABS } from "@/lib/quiniela";

export default function QuinielaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <SectionTabs tabs={[...QUINIELA_TABS]} className="min-w-0 flex-1" />
        <SeasonSelector className="w-full border-[#214C9B]/20 sm:w-auto sm:shrink-0" />
      </div>
      {children}
    </div>
  );
}
