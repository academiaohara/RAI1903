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
        "flex aspect-square items-center justify-center overflow-hidden rounded-xl p-1 shadow-sm ring-1 ring-black/10",
        className,
      )}
      style={teamStripeBackgroundStyle(team.colors)}
    >
      <TeamCrest
        team={team}
        size="md"
        className="relative z-10 h-[80%] w-[80%] max-h-none max-w-none drop-shadow-md"
      />
    </div>
  );
}
