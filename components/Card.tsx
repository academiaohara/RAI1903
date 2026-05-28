import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
  /** Sin borde inferior en la cabecera (p. ej. seccion Competicion). */
  borderlessHeader?: boolean;
};

export function Card({ eyebrow, title, action, children, className, dense = false, borderlessHeader = false }: CardProps) {
  return (
    <section className={cn(className)}>
      {(eyebrow || title || action) && (
        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-3 sm:gap-4",
            !borderlessHeader && "border-b border-[#214C9B]/15",
            dense ? "p-4" : "p-5",
          )}
        >
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{eyebrow}</p>}
            {title && (
              <h2 className="mt-1 text-xl font-extrabold uppercase leading-tight text-[#214C9B] sm:text-2xl lg:text-4xl">
                {title}
              </h2>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={dense ? "p-4" : "p-5"}>{children}</div>
    </section>
  );
}
