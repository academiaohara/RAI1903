import { OpponentCrest } from "@/components/OpponentCrest";
import { cn } from "@/lib/utils";

type MatchScoreCenterProps = {
  homeLogo: string;
  homeTeam: string;
  awayLogo: string;
  awayTeam: string;
  centerLabel: string;
  sublabel?: string;
  className?: string;
};

export function MatchScoreCenter({
  homeLogo,
  homeTeam,
  awayLogo,
  awayTeam,
  centerLabel,
  sublabel,
  className,
}: MatchScoreCenterProps) {
  return (
    <div
      className={cn(
        "flex h-full w-[12rem] shrink-0 flex-col items-center justify-center self-stretch bg-[#214C9B] px-4 py-4 text-white lg:px-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 lg:gap-4">
        <OpponentCrest logo={homeLogo} opponent={homeTeam} size="sm" className="shrink-0" />
        <p className="text-3xl font-extrabold leading-none lg:text-4xl">{centerLabel}</p>
        <OpponentCrest logo={awayLogo} opponent={awayTeam} size="sm" className="shrink-0" />
      </div>
      {sublabel ? (
        <p className="mt-1 text-xs font-bold uppercase tracking-normal text-white/80">{sublabel}</p>
      ) : null}
    </div>
  );
}
