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
    <section className={cn("card-shine rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/20 backdrop-blur", className)}>
      {(eyebrow || title || action) && (
        <div className={cn("flex items-start justify-between gap-4 border-b border-white/10", dense ? "p-4" : "p-5")}>
          <div>
            {eyebrow && <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/70">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-xl font-black tracking-tight text-white">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className={dense ? "p-4" : "p-5"}>{children}</div>
    </section>
  );
}
