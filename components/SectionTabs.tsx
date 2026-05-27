"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export type SectionTab = {
  href: string;
  label: string;
  description?: string;
};

type SectionTabsProps = {
  tabs: SectionTab[];
  className?: string;
  variant?: "horizontal" | "sidebar";
};

const shellClassName =
  "rounded-3xl border border-[#214C9B]/20 bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.06)]";

export function SectionTabs({ tabs, className, variant = "horizontal" }: SectionTabsProps) {
  const pathname = usePathname();
  const isSidebar = variant === "sidebar";

  return (
    <nav
      className={cn(
        shellClassName,
        isSidebar ? "flex w-full flex-col gap-2 lg:w-56 lg:shrink-0" : "no-scrollbar flex gap-2 overflow-x-auto",
        className,
      )}
      aria-label="Subsecciones"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href as Route}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-normal transition",
              isSidebar ? "w-full text-left" : "min-w-fit",
              active
                ? "border-[#214C9B] bg-[#214C9B] !text-white shadow-md shadow-blue-950/10"
                : "border-[#214C9B]/15 bg-white text-[#214C9B] hover:border-[#214C9B] hover:bg-blue-50 hover:text-[#214C9B]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
