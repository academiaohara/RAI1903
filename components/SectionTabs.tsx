"use client";

import { SubsectionNav, type SubsectionTab } from "@/components/SubsectionNav";
import { cn } from "@/lib/utils";

export type SectionTab = SubsectionTab & {
  description?: string;
};

type SectionTabsProps = {
  tabs: SectionTab[];
  className?: string;
};

export function SectionTabs({ tabs, className }: SectionTabsProps) {
  return <SubsectionNav tabs={tabs} className={cn(className)} />;
}
