import type { ReactNode } from "react";
import { TitleWithOrnament } from "@/components/TitleWithOrnament";
import { cn } from "@/lib/utils";

type CardProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
};

export function Card({ eyebrow, title, action, children, className, dense = false }: CardProps) {
  return (
    <section className={cn(className)}>
      {(eyebrow || title || action) && (
        <div className={cn("flex items-start justify-between gap-4 border-b border-[#214C9B]/15", dense ? "p-4" : "p-5")}>
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{eyebrow}</p>}
            {title && (
              <div className="mt-1">
                <TitleWithOrnament title={title} as="h2" size="section" />
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={dense ? "p-4" : "p-5"}>{children}</div>
    </section>
  );
}
