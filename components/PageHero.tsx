import type { ReactNode } from "react";
import { AnimatedPageTitle } from "@/components/AnimatedPageTitle";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  /** Shorter hero title on viewports below 640px. */
  titleMobile?: string;
  description: string;
  children?: ReactNode;
  titleActions?: ReactNode;
  titleSize?: "default" | "compact";
  titleActionsClassName?: string;
  className?: string;
  titleWrapperClassName?: string;
};

export function PageHero({
  eyebrow,
  title,
  titleMobile,
  description,
  children,
  titleActions,
  titleSize = "default",
  titleActionsClassName,
  className,
  titleWrapperClassName,
}: PageHeroProps) {
  return (
    <section className={cn(className)}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{eyebrow}</p>}
      <div className={cn("grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end", eyebrow && "mt-2")}>
        <div className="min-w-0 max-w-full">
          <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-3">
            <AnimatedPageTitle
              title={title}
              mobileTitle={titleMobile}
              size={titleSize}
              wrapperClassName={titleWrapperClassName}
            />
            {titleActions ? (
              <div className={cn("ml-auto shrink-0 sm:ml-auto", titleActionsClassName)}>{titleActions}</div>
            ) : null}
          </div>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
