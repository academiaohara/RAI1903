import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function PageHero({ eyebrow, title, description, children, className }: PageHeroProps) {
  return (
    <section className={cn(className)}>
      <Badge tone="blue">{eyebrow}</Badge>
      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="text-5xl font-extrabold uppercase leading-none text-[#214C9B] sm:text-6xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
