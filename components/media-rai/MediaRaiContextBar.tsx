"use client";

import { SectionTabs } from "@/components/SectionTabs";
import { mediaRaiTabsFromSections } from "@/lib/media-rai-sections";
import { useMediaRaiSections } from "@/components/media-rai/MediaRaiSectionsProvider";

export function MediaRaiContextBar() {
  const { sections } = useMediaRaiSections();
  const tabs = mediaRaiTabsFromSections(sections);

  return (
    <section aria-label="Contexto de Media RAI" className="space-y-3">
      <SectionTabs tabs={tabs} />
    </section>
  );
}
