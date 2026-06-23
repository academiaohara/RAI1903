"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BglStepContentProps = {
  title: string;
  description?: string;
  instruction?: string;
  children?: ReactNode;
  className?: string;
};

export function BglStepContent({
  title,
  description,
  instruction,
  children,
  className,
}: BglStepContentProps) {
  return (
    <section className={cn("bgl-step-content", className)}>
      <div className="bgl-step-copy">
        <h1 className="bgl-step-title">{title}</h1>
        {description ? <p className="bgl-step-description">{description}</p> : null}
        {instruction ? <p className="bgl-step-instruction">{instruction}</p> : null}
      </div>
      {children ? <div className="bgl-step-panel">{children}</div> : null}
    </section>
  );
}
