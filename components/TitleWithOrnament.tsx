"use client";

import { GearAdorno } from "@/components/GearAdorno";
import { cn } from "@/lib/utils";
import { useId, type ElementType } from "react";

const sizeClasses = {
  page: "text-5xl sm:text-6xl",
  section: "text-2xl sm:text-3xl lg:text-4xl",
} as const;

/** Gear icon size; text overlaps by half so it reaches the adorno center line. */
const gearSizeClass = "h-[1.38em] w-[1.38em]";
const gearTextOverlapClass = "-ml-[0.74em]";

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
  const cutoutId = `title-gear-cutout-${useId().replaceAll(":", "")}`;

  return (
    <div
      className={cn(
        "page-title-gear inline-flex max-w-full items-center overflow-visible bg-transparent text-[#214C9B]",
        sizeClasses[size],
      )}
    >
      <div
        className={cn(
          "inline-flex max-w-full items-center overflow-visible bg-transparent",
          animated && "page-title-gear-wrap",
        )}
      >
        <GearAdorno
          cutoutId={cutoutId}
          className={cn(
            "page-title-gear-icon pointer-events-none shrink-0 self-center bg-transparent text-current",
            gearSizeClass,
            animated && "page-title-gear-left",
          )}
        />
        <Tag
          className={cn(
            gearTextOverlapClass,
            "relative z-10 mb-[2px] min-w-0 self-center bg-transparent py-[0.22em] pr-[0.35em] pl-0 font-extrabold leading-none whitespace-nowrap uppercase text-current",
            animated && "page-title-gear-text",
            className,
          )}
        >
          {title}
        </Tag>
      </div>
    </div>
  );
}
