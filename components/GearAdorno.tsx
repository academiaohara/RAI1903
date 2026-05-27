import { ADORNO_PATH, ADORNO_TRANSFORM, ADORNO_VIEWBOX } from "@/lib/adorno-path";
import { cn } from "@/lib/utils";

type GearAdornoProps = {
  className?: string;
};

export function GearAdorno({ className }: GearAdornoProps) {
  return (
    <svg
      aria-hidden
      viewBox={ADORNO_VIEWBOX}
      className={cn("block text-[#214C9B]", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={ADORNO_TRANSFORM}>
        <path d={ADORNO_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}
