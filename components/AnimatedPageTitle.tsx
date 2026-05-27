"use client";

import { useId } from "react";
import { GearAdornoHalf } from "@/components/GearAdornoHalf";
import { cn } from "@/lib/utils";

type AnimatedPageTitleProps = {
  title: string;
  className?: string;
};

export function AnimatedPageTitle({ title, className }: AnimatedPageTitleProps) {
  const baseId = useId();
  const leftClipId = `${baseId}-gear-left`;
  const rightClipId = `${baseId}-gear-right`;

  return (
    <div className="page-title-gear inline-flex max-w-full items-center text-5xl leading-none text-[#214C9B] sm:text-6xl">
      <GearAdornoHalf side="left" clipId={leftClipId} />
      <h1
        className={cn(
          "page-title-gear-text min-w-0 overflow-hidden whitespace-nowrap font-extrabold uppercase",
          className,
        )}
      >
        {title}
      </h1>
      <GearAdornoHalf side="right" clipId={rightClipId} className="page-title-gear-right" />
    </div>
  );
}
