import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
  titleActions?: ReactNode;
  className?: string;
};

export function PageHero({ eyebrow, title, description, children, titleActions, className }: PageHeroProps) {
  return (
    <section className={cn(className)}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{eyebrow}</p>}
      <div className={cn("grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end", eyebrow && "mt-2")}>
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="text-5xl font-extrabold uppercase leading-none text-[#214C9B] sm:text-6xl">{title}</h1>
            {titleActions}
          </div>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
