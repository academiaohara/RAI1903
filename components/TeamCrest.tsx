import { OpponentCrest } from "@/components/OpponentCrest";
import { getTeamCrest } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";

type TeamCrestProps = {
  team: Pick<Team, "id" | "name" | "crestInitials">;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const opponentSize = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

const wrapperSize = {
  sm: "h-7 w-7",
  md: "h-12 w-12",
  lg: "h-28 w-28 [&>img]:h-28 [&>img]:w-28 [&>span]:h-28 [&>span]:w-28 [&>span]:rounded-3xl [&>span]:text-4xl",
} as const;

export function TeamCrest({ team, size = "md", className }: TeamCrestProps) {
  return (
    <OpponentCrest
      logo={getTeamCrest(team)}
      opponent={team.name}
      size={opponentSize[size]}
      className={cn(wrapperSize[size], className)}
    />
  );
}
