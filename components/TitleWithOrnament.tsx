"use client";

import { GearAdorno } from "@/components/GearAdorno";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

const sizeClasses = {
  page: "text-5xl sm:text-6xl",
  section: "text-xl sm:text-2xl",
} as const;

type TitleWithOrnamentProps = {
  title: string;
  as?: ElementType;
  size?: keyof typeof sizeClasses;
  animated?: boolean;
  className?: string;
};

export function TitleWithOrnament({
  title,
  as: Tag = "h2",
  size = "section",
  animated = false,
  className,
}: TitleWithOrnamentProps) {
  return (
    <div
      className={cn(
        "page-title-gear inline-flex max-w-full items-center leading-none text-[#214C9B]",
        sizeClasses[size],
      )}
    >
      <div
        className={cn(
          "relative inline-flex max-w-full items-center",
          animated && "page-title-gear-wrap overflow-hidden",
        )}
      >
        <GearAdorno
          className={cn(
            "pointer-events-none absolute top-1/2 left-0 z-10 h-[1.12em] w-[1.12em] -translate-x-[46%] -translate-y-1/2 shrink-0",
            animated && "page-title-gear-left",
          )}
        />
        <div
          className={cn(
            "relative bg-white py-[0.14em] pr-[0.35em] pl-[0.62em] shadow-[0_1px_0_rgba(33,76,155,0.08)]",
            animated && "page-title-gear-bar",
          )}
        >
          <Tag
            className={cn(
              "min-w-0 font-extrabold whitespace-nowrap uppercase",
              animated && "page-title-gear-text",
              className,
            )}
          >
            {title}
          </Tag>
        </div>
      </div>
    </div>
  );
}
