import type { ReactNode } from "react";
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
    <section className={cn("card-shine rounded-3xl border border-[#214C9B]/20 bg-white shadow-[0_18px_45px_rgba(17,24,39,0.08)]", className)}>
      {(eyebrow || title || action) && (
        <div className={cn("flex items-start justify-between gap-4 border-b border-[#214C9B]/15", dense ? "p-4" : "p-5")}>
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-xl font-extrabold uppercase tracking-tight text-[#214C9B]">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className={dense ? "p-4" : "p-5"}>{children}</div>
    </section>
  );
}
