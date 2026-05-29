import { getCompetitionLogo } from "@/lib/competition-logos";
import { cn } from "@/lib/utils";
import type { CompetitionId } from "@/types";

type CompetitionLogoProps = {
  competition: CompetitionId | string;
  alt: string;
  className?: string;
  size?: "xs" | "sm" | "md";
};

const sizeClass = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-7 w-7",
} as const;

export function CompetitionLogo({ competition, alt, className, size = "sm" }: CompetitionLogoProps) {
  const src = getCompetitionLogo(competition);
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("shrink-0 object-contain", sizeClass[size], className)} />
  );
}
