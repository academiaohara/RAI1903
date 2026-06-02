"use client";

import { SectionTabs } from "@/components/SectionTabs";
import { SeasonSelector } from "@/components/SeasonSelector";
import { QUINIELA_TABS } from "@/lib/quiniela";

export default function QuinielaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionTabs tabs={[...QUINIELA_TABS]} className="flex-1" />
        <SeasonSelector className="border-[#214C9B]/20 shrink-0" />
      </div>
      {children}
    </div>
  );
}
