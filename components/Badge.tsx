import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "blue" | "red" | "green" | "amber" | "slate" | "white" | "masculino" | "femenino";

const toneClasses: Record<BadgeTone, string> = {
  blue: "border-blue-200 bg-blue-50 text-[#214C9B]",
  red: "border-red-200 bg-red-50 text-[#981915]",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  white: "border-white bg-white text-[#214C9B]",
  masculino: "border-[#214C9B] bg-[#214C9B] text-white",
  femenino: "border-[#981915] bg-[#981915] text-white",
};

export function Badge({ children, tone = "blue", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
