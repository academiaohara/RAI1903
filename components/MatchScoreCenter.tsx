import { OpponentCrest } from "@/components/OpponentCrest";
import { matchFixtureBannerCenterWidthClassName } from "@/lib/match-card-styles";
import { cn } from "@/lib/utils";

type MatchScoreCenterAccent = "blue" | "granate";

type MatchScoreCenterProps = {
  homeLogo: string;
  homeTeam: string;
  homeTeamId?: string;
  awayLogo: string;
  awayTeam: string;
  awayTeamId?: string;
  centerLabel: string;
  sublabel?: string;
  className?: string;
  accent?: MatchScoreCenterAccent;
};

function matchScoreCenterSublabelClass(accent: MatchScoreCenterAccent): string {
  return accent === "granate"
    ? "text-white/80 group-hover:text-[#981915]/80"
    : "text-white/80 group-hover:text-[#214C9B]/80";
}

export function MatchScoreCenter({
  homeLogo,
  homeTeam,
  homeTeamId,
  awayLogo,
  awayTeam,
  awayTeamId,
  centerLabel,
  sublabel,
  className,
  accent = "blue",
}: MatchScoreCenterProps) {
  const crestOnGranate = accent === "granate";

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col items-center justify-center self-stretch px-4 py-4 transition-colors duration-200 lg:px-6",
        matchFixtureBannerCenterWidthClassName,
        className,
      )}
    >
      <div className="flex flex-nowrap items-center justify-center gap-3 lg:gap-4">
        <OpponentCrest
          logo={homeLogo}
          opponent={homeTeam}
          teamId={homeTeamId}
          onGranateBackground={crestOnGranate}
          size="md"
          className="shrink-0 lg:h-14 lg:w-14"
        />
        <p className="text-3xl font-extrabold leading-none transition-colors duration-200 lg:text-4xl">{centerLabel}</p>
        <OpponentCrest
          logo={awayLogo}
          opponent={awayTeam}
          teamId={awayTeamId}
          onGranateBackground={crestOnGranate}
          size="md"
          className="shrink-0 lg:h-14 lg:w-14"
        />
      </div>
      {sublabel ? (
        <p
          className={cn(
            "mt-1 text-xs font-bold uppercase tracking-normal transition-colors duration-200",
            matchScoreCenterSublabelClass(accent),
          )}
        >
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}
