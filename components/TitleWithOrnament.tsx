"use client";

import { GearAdorno } from "@/components/GearAdorno";
import { cn } from "@/lib/utils";
import { useId, type ElementType } from "react";

const pageTitleClass = "text-[clamp(2rem,9vw,3.75rem)]";
const gearSizeClass = "h-[1.38em] w-[1.38em]";
const gearTextOverlapClass = "-ml-[0.74em]";

type TitleWithOrnamentProps = {
  title: string;
  /** Shorter label below the `sm` breakpoint (640px). */
  mobileTitle?: string;
  as?: ElementType;
  animated?: boolean;
  className?: string;
  wrapperClassName?: string;
};

export function TitleWithOrnament({
  title,
  mobileTitle,
  as: Tag = "h1",
  animated = false,
  className,
  wrapperClassName,
}: TitleWithOrnamentProps) {
  const cutoutId = `title-gear-cutout-${useId().replaceAll(":", "")}`;
  const startsWithC =
    /^c/i.test(title.trim()) || (mobileTitle != null && /^c/i.test(mobileTitle.trim()));

  return (
    <div
      className={cn(
        "title-gear inline-flex max-w-full items-center overflow-visible bg-transparent",
        pageTitleClass,
        wrapperClassName,
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
            "relative z-10 mb-[2px] min-w-0 self-center bg-transparent py-[0.22em] pr-[0.35em] pl-0 font-extrabold leading-[0.95] break-words uppercase text-[#214C9B]",
            animated && "title-gear-text",
            startsWithC && "title-gear-text-c",
            className,
          )}
        >
          {mobileTitle ? (
            <>
              <span className="sm:hidden">{mobileTitle}</span>
              <span className="hidden sm:inline">{title}</span>
            </>
          ) : (
            title
          )}
        </Tag>
      </div>
    </div>
  );
}
