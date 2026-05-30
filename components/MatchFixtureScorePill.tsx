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
        "flex shrink-0 items-center gap-2 rounded-2xl bg-[#214C9B] px-2 py-2 text-sm font-extrabold text-white shadow-md shadow-blue-950/10",
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
