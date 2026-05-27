"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export type SubsectionTab = {
  href: string;
  label: string;
};

const tabClassName = (active: boolean) =>
  cn(
    "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-normal transition",
    active
      ? "bg-[#214C9B] !text-white shadow-md shadow-blue-950/15 hover:!text-white"
      : "text-[#214C9B] hover:bg-blue-50",
  );

type SubsectionNavProps = {
  tabs: SubsectionTab[];
  className?: string;
  ariaLabel?: string;
};

export function SubsectionNav({ tabs, className, ariaLabel = "Subsecciones" }: SubsectionNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("no-scrollbar flex gap-1.5 overflow-x-auto", className)} aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href as Route}
            aria-current={active ? "page" : undefined}
            className={tabClassName(active)}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { tabClassName as subsectionTabClassName };
