"use client";

import { UserAvatar } from "@/components/auth/UserAvatar";
import { getPodiumBadgeClass, getRankingRowClass } from "@/lib/ranking-display";
import { cn } from "@/lib/utils";

type RankingRowProps = {
  rank: number;
  handle: string;
  avatarUrl: string | null;
  points: number;
  countPoints?: boolean;
  isCurrentUser?: boolean;
  onClick?: () => void;
  className?: string;
};

export function RankingRow({
  rank,
  handle,
  avatarUrl,
  points,
  countPoints = true,
  isCurrentUser = false,
  onClick,
  className,
}: RankingRowProps) {
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold sm:h-8 sm:w-8 sm:text-xs",
            getPodiumBadgeClass(rank),
          )}
        >
          {rank}
        </span>
        <UserAvatar avatarUrl={avatarUrl} label={handle} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-extrabold text-[#214C9B]">{handle}</p>
          {isCurrentUser ? (
            <p className="text-[10px] font-semibold text-[#214C9B]/70 sm:text-xs">Tú</p>
          ) : null}
        </div>
      </div>
      <span className="shrink-0 font-extrabold text-slate-900">
        {countPoints ? `${points} pts` : "—"}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          getRankingRowClass(rank, isCurrentUser),
          "cursor-pointer text-left transition",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={cn(getRankingRowClass(rank, isCurrentUser), className)}>{content}</div>;
}
