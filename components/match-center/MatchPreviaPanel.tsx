import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { MatchCaraACaraSection } from "@/components/match-center/MatchCaraACaraSection";
import { EditableMatchVideoBlock } from "@/components/match-center/EditableMatchVideoBlock";
import { getTeamByGender } from "@/lib/fixtures";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn, resultTone } from "@/lib/utils";
import { MatchAvailabilityPanel } from "@/components/match-center/MatchAvailabilityPanel";
import type { MatchDetail, MatchVideo, PrimerEquipoGender, RecentFormMatch } from "@/types";

function teamCrestForRow(teamId: string | undefined, teamName: string, gender: PrimerEquipoGender): string {
  if (!teamId) return teamName.slice(0, 3).toUpperCase();
  const team = getTeamByGender(teamId, gender);
  return getTeamCrestById(teamId, team?.crestInitials ?? teamName.slice(0, 3).toUpperCase());
}

function resultBadge(resultCode: RecentFormMatch["resultCode"]) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-extrabold",
        resultTone(resultCode),
      )}
    >
      {resultCode === "G" ? "V" : resultCode === "E" ? "E" : "D"}
    </span>
  );
}

function RecentMatchMobileRow({ row, gender }: { row: RecentFormMatch; gender: PrimerEquipoGender }) {
  return (
    <article className="border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2">
        <div className="flex min-w-0 justify-end">
          <OpponentCrest
            logo={teamCrestForRow(row.homeTeamId, row.homeTeam, gender)}
            opponent={row.homeTeam}
            teamId={row.homeTeamId}
            size="sm"
            className="shrink-0"
          />
        </div>
        <p className="min-w-[2.75rem] text-center text-sm font-extrabold tabular-nums text-[#214C9B]">{row.score}</p>
        <div className="flex min-w-0 justify-start">
          <OpponentCrest
            logo={teamCrestForRow(row.awayTeamId, row.awayTeam, gender)}
            opponent={row.awayTeam}
            teamId={row.awayTeamId}
            size="sm"
            className="shrink-0"
          />
        </div>
        {resultBadge(row.resultCode)}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
        <span className="tabular-nums">{row.date}</span>
        <span className="min-w-0 truncate text-right">{row.competition}</span>
      </div>
    </article>
  );
}

function RecentMatchDesktopRow({ row }: { row: RecentFormMatch }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_4rem_minmax(0,1fr)_5rem_2rem] items-center gap-x-3 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <span className="font-semibold tabular-nums text-slate-600">{row.date}</span>
      <span className="min-w-0 truncate font-semibold text-slate-800" title={row.homeTeam}>
        {row.homeTeam}
      </span>
      <span className="text-center font-extrabold tabular-nums text-[#214C9B]">{row.score}</span>
      <span className="min-w-0 truncate text-right font-semibold text-slate-800" title={row.awayTeam}>
        {row.awayTeam}
      </span>
      <span className="truncate text-slate-500">{row.competition}</span>
      <div className="flex justify-end">{resultBadge(row.resultCode)}</div>
    </div>
  );
}

function RecentMatchesTable({
  title,
  matches,
  gender,
}: {
  title: string;
  matches: RecentFormMatch[];
  gender: PrimerEquipoGender;
}) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Sin partidos recientes para {title}.
      </p>
    );
  }

  return (
    <>
      <div className="md:hidden">
        {matches.map((row) => (
          <RecentMatchMobileRow key={`${row.date}-${row.homeTeam}-${row.score}`} row={row} gender={gender} />
        ))}
      </div>
      <div className="hidden md:block">
        {matches.map((row) => (
          <RecentMatchDesktopRow key={`${row.date}-${row.homeTeam}-${row.score}`} row={row} />
        ))}
      </div>
    </>
  );
}

export function MatchPreviaPanel({
  detail,
  compact = false,
  rdpVideo,
  showCaraACara = true,
}: {
  detail: MatchDetail;
  compact?: boolean;
  rdpVideo?: MatchVideo | null;
  /** @deprecated use showCaraACara */
  showH2H?: boolean;
  showCaraACara?: boolean;
}) {
  const { match, gender, homeRecentMatches, awayRecentMatches, availability } = detail;
  const video = rdpVideo ?? detail.rdpPrevia;
  const showComparison = showCaraACara;

  return (
    <div className="space-y-8">
      {!compact && showComparison && (
        <section>
          <MatchCaraACaraSection detail={detail} />
        </section>
      )}

      {!compact && (
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Ultimos 5 partidos</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-slate-800">
                <TeamLink gender={gender} teamId={match.homeTeamId} teamName={match.homeTeam}>
                  {match.homeTeam}
                </TeamLink>
              </h3>
              <RecentMatchesTable title={match.homeTeam} matches={homeRecentMatches} gender={gender} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-slate-800">
                <TeamLink gender={gender} teamId={match.awayTeamId} teamName={match.awayTeam}>
                  {match.awayTeam}
                </TeamLink>
              </h3>
              <RecentMatchesTable title={match.awayTeam} matches={awayRecentMatches} gender={gender} />
            </div>
          </div>
        </section>
      )}

      {!compact && (
        <MatchAvailabilityPanel
          matchId={match.id}
          gender={gender}
          homeTeamId={match.homeTeamId}
          awayTeamId={match.awayTeamId}
          availability={availability}
          homeLabel={match.homeTeam}
          awayLabel={match.awayTeam}
        />
      )}

      <EditableMatchVideoBlock
        matchId={match.id}
        field="rdpPrevia"
        videoLabel="RDP Previa"
        fallback={video}
      />
    </div>
  );
}
