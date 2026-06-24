import { TeamCrest } from "@/components/TeamCrest";
import { teamStripeBackgroundStyle } from "@/lib/team-stripes";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";

type GuiaLigaCrestCellProps = {
  team: Pick<Team, "id" | "name" | "crestInitials" | "colors">;
  className?: string;
};

export function GuiaLigaCrestCell({ team, className }: GuiaLigaCrestCellProps) {
  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center overflow-hidden rounded-xl p-2 shadow-sm ring-1 ring-black/10",
        className,
      )}
      style={teamStripeBackgroundStyle(team.colors)}
    >
      <TeamCrest
        team={team}
        size="md"
        className="relative z-10 h-full w-full max-h-14 max-w-14 drop-shadow-md"
      />
    </div>
  );
}
