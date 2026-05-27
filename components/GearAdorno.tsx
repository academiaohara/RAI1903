import { ADORNO_PATH, ADORNO_TRANSFORM, ADORNO_VIEWBOX } from "@/lib/adorno-path";
import { cn } from "@/lib/utils";

type GearAdornoProps = {
  className?: string;
  cutoutId?: string;
};

export function GearAdorno({ className, cutoutId }: GearAdornoProps) {
  return (
    <svg
      aria-hidden
      viewBox={ADORNO_VIEWBOX}
      className={cn("block text-current", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      {cutoutId && (
        <defs>
          <mask id={cutoutId} maskUnits="userSpaceOnUse" x="0" y="0" width="1161.3322" height="1149.9065">
            <rect x="0" y="0" width="1161.3322" height="1149.9065" fill="white" />
            <path
              d="M 610 344 H 1161.3322 V 805.9065 H 610 C 708 744 760 665 760 574.9532 C 760 484 708 406 610 344 Z"
              fill="black"
            />
          </mask>
        </defs>
      )}
      <g transform={ADORNO_TRANSFORM} mask={cutoutId ? `url(#${cutoutId})` : undefined}>
        <path d={ADORNO_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}
