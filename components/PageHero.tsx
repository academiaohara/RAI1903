import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function PageHero({ eyebrow, title, description, children, className }: PageHeroProps) {
  return (
    <section className={cn(className)}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{eyebrow}</p>}
      <div className={cn("grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end", eyebrow && "mt-2")}>
        <div className="w-fit max-w-full">
          <h1 className="text-5xl font-extrabold uppercase leading-none text-[#214C9B] sm:text-6xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
