"use client";

import { GearAdorno } from "@/components/GearAdorno";
import { cn } from "@/lib/utils";
import { useId, type ElementType } from "react";

const pageTitleClass = "text-5xl sm:text-6xl";
const gearSizeClass = "h-[1.38em] w-[1.38em]";
const gearTextOverlapClass = "-ml-[0.74em]";

type TitleWithOrnamentProps = {
  title: string;
  as?: ElementType;
  animated?: boolean;
  className?: string;
};

export function TitleWithOrnament({
  title,
  as: Tag = "h1",
  animated = false,
  className,
}: TitleWithOrnamentProps) {
  const cutoutId = `title-gear-cutout-${useId().replaceAll(":", "")}`;

  return (
    <div
      className={cn(
        "title-gear inline-flex max-w-full items-center overflow-visible bg-transparent",
        pageTitleClass,
      )}
    >
      <div
        className={cn(
          "inline-flex max-w-full items-center overflow-visible bg-transparent",
          animated && "title-gear-wrap",
        )}
      >
        <GearAdorno
          cutoutId={cutoutId}
          className={cn(
            "title-gear-icon pointer-events-none shrink-0 self-center bg-transparent text-[var(--rai-red)]",
            gearSizeClass,
            animated && "title-gear-icon-reveal",
          )}
        />
        <Tag
          className={cn(
            gearTextOverlapClass,
            "relative z-10 mb-[2px] min-w-0 self-center bg-transparent py-[0.22em] pr-[0.35em] pl-0 font-extrabold leading-none whitespace-nowrap uppercase text-[#214C9B]",
            animated && "title-gear-text",
            className,
          )}
        >
          {title}
        </Tag>
      </div>
    </div>
  );
}
