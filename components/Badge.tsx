import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "blue" | "red" | "green" | "amber" | "slate" | "white";

const toneClasses: Record<BadgeTone, string> = {
  blue: "border-blue-300/25 bg-blue-500/15 text-blue-100",
  red: "border-red-300/25 bg-[#981915]/25 text-red-100",
  green: "border-emerald-300/25 bg-emerald-500/15 text-emerald-100",
  amber: "border-amber-300/25 bg-amber-400/15 text-amber-100",
  slate: "border-slate-300/15 bg-slate-700/40 text-slate-100",
  white: "border-white/30 bg-white/10 text-white",
};

export function Badge({ children, tone = "blue", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em]", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
