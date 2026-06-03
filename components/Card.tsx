import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
  /** Sin borde inferior en la cabecera (p. ej. seccion Competición). */
  borderlessHeader?: boolean;
};

export function Card({ eyebrow, title, action, children, className, dense = false, borderlessHeader = false }: CardProps) {
  return (
    <section className={cn(className)}>
      {(eyebrow || title || action) && (
        <div
          className={cn(
            "flex flex-row flex-wrap items-center gap-2 sm:items-start sm:justify-between sm:gap-3 md:gap-4",
            !borderlessHeader && "border-b border-[#214C9B]/15",
            dense ? "p-3 sm:p-4" : "p-3 sm:p-5",
          )}
        >
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#981915] sm:text-xs">{eyebrow}</p>
            )}
            {title && (
              <h2 className="mt-0.5 text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:mt-1 sm:text-2xl lg:text-4xl">
                {title}
              </h2>
            )}
          </div>
          {action ? <div className="ml-auto shrink-0 sm:ml-auto">{action}</div> : null}
        </div>
      )}
      <div className={dense ? "p-3 sm:p-4" : "p-3 sm:p-5"}>{children}</div>
    </section>
  );
}
