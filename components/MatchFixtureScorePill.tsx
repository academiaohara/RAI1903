import { OpponentCrest } from "@/components/OpponentCrest";
import { cn } from "@/lib/utils";

type MatchFixtureScorePillProps = {
  homeLogo: string;
  homeTeam: string;
  awayLogo: string;
  awayTeam: string;
  label: string;
  className?: string;
  showCrests?: boolean;
};

export function MatchFixtureScorePill({
  homeLogo,
  homeTeam,
  awayLogo,
  awayTeam,
  label,
  className,
  showCrests = true,
}: MatchFixtureScorePillProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-xl bg-[#214C9B] px-1.5 py-1 text-xs font-extrabold text-white shadow-md shadow-blue-950/10 sm:gap-2 sm:rounded-2xl sm:px-2 sm:py-2 sm:text-sm",
        !showCrests && "px-3",
        className,
      )}
    >
      {showCrests ? <OpponentCrest logo={homeLogo} opponent={homeTeam} size="sm" className="shrink-0" /> : null}
      <span className="tabular-nums">{label}</span>
      {showCrests ? <OpponentCrest logo={awayLogo} opponent={awayTeam} size="sm" className="shrink-0" /> : null}
    </div>
  );
}
