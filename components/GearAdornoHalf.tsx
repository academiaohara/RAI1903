import { ADORNO_PATH, ADORNO_SPLIT_X, ADORNO_TRANSFORM, ADORNO_VIEWBOX } from "@/lib/adorno-path";
import { cn } from "@/lib/utils";

type GearAdornoHalfProps = {
  side: "left" | "right";
  clipId: string;
  className?: string;
};

export function GearAdornoHalf({ side, clipId, className }: GearAdornoHalfProps) {
  const clipRect =
    side === "left"
      ? { x: 0, y: 0, width: ADORNO_SPLIT_X, height: 1149.9065 }
      : { x: ADORNO_SPLIT_X, y: 0, width: ADORNO_SPLIT_X, height: 1149.9065 };

  return (
    <svg
      aria-hidden
      viewBox={ADORNO_VIEWBOX}
      className={cn("block h-[1em] w-[0.5em] shrink-0 self-center text-[#214C9B]", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <rect {...clipRect} />
        </clipPath>
      </defs>
      <g transform={ADORNO_TRANSFORM} clipPath={`url(#${clipId})`}>
        <path d={ADORNO_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}
