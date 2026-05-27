import {
  ADORNO_PATH,
  ADORNO_TRANSFORM,
  ADORNO_VIEWBOX,
  ADORNO_VIEWBOX_HEIGHT,
  ADORNO_VIEWBOX_WIDTH,
  adornoTextCutoutPath,
} from "@/lib/adorno-path";
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
      className={cn("block shrink-0 overflow-visible text-current", className)}
      preserveAspectRatio="xMidYMid meet"
      style={{ overflow: "visible" }}
    >
      {cutoutId && (
        <defs>
          <mask
            id={cutoutId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={ADORNO_VIEWBOX_WIDTH}
            height={ADORNO_VIEWBOX_HEIGHT}
          >
            <rect x="0" y="0" width={ADORNO_VIEWBOX_WIDTH} height={ADORNO_VIEWBOX_HEIGHT} fill="white" />
            <path d={adornoTextCutoutPath()} fill="black" />
          </mask>
        </defs>
      )}
      <g transform={ADORNO_TRANSFORM} mask={cutoutId ? `url(#${cutoutId})` : undefined}>
        <path d={ADORNO_PATH} fill="var(--rai-red)" />
      </g>
    </svg>
  );
}
