"use client";

import { SeasonSelector } from "@/components/SeasonSelector";
import { SectionTabs } from "@/components/SectionTabs";
import { mediaRaiTabsFromSections } from "@/lib/media-rai-sections";
import { useMediaRaiSections } from "@/components/media-rai/MediaRaiSectionsProvider";

export function MediaRaiContextBar() {
  const { sections } = useMediaRaiSections();
  const tabs = mediaRaiTabsFromSections(sections);

  return (
    <section aria-label="Contexto de Media RAI" className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTabs tabs={tabs} className="min-w-0 flex-1" />
        <SeasonSelector className="border-[#214C9B]/15 bg-[#214C9B]/5 shrink-0" />
      </div>
    </section>
  );
}
