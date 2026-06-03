import { TeamLink } from "@/components/TeamLink";
import { MatchCaraACaraSection } from "@/components/match-center/MatchCaraACaraSection";
import { MatchVideoBlock } from "@/components/match-center/MatchVideoBlock";
import { cn, resultTone } from "@/lib/utils";
import { MatchAvailabilityPanel } from "@/components/match-center/MatchAvailabilityPanel";
import type { MatchDetail, MatchVideo, RecentFormMatch } from "@/types";

const RECENT_MATCHES_TABLE_COLGROUP = (
  <colgroup>
    <col className="w-[5.25rem]" />
    <col />
    <col className="w-[4.75rem]" />
    <col />
    <col className="w-[5.5rem]" />
    <col className="w-[2.25rem]" />
  </colgroup>
);

function RecentMatchesTable({ title, matches }: { title: string; matches: RecentFormMatch[] }) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Sin partidos recientes para {title}.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] table-fixed border-collapse text-left text-sm">
        {RECENT_MATCHES_TABLE_COLGROUP}
        <thead>
          <tr className="border-b border-[#214C9B]/15 text-xs font-bold uppercase text-slate-500">
            <th className="py-2 pr-2">Fecha</th>
            <th className="py-2 pr-2">Local</th>
            <th className="py-2 pr-2">Resultado</th>
            <th className="py-2 pr-2">Visitante</th>
            <th className="py-2 pr-2">Comp.</th>
            <th className="py-2">R</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((row) => (
            <tr key={`${row.date}-${row.homeTeam}-${row.score}`} className="border-b border-slate-100">
              <td className="py-2 pr-2 font-semibold tabular-nums text-slate-600">{row.date}</td>
              <td className="max-w-0 truncate py-2 pr-2 font-semibold text-slate-800">{row.homeTeam}</td>
              <td className="py-2 pr-2 font-extrabold tabular-nums text-[#214C9B]">{row.score}</td>
              <td className="max-w-0 truncate py-2 pr-2 font-semibold text-slate-800">{row.awayTeam}</td>
              <td className="truncate py-2 pr-2 text-slate-500">{row.competition}</td>
              <td className="py-2">
                <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded text-xs font-extrabold", resultTone(row.resultCode))}>
                  {row.resultCode === "G" ? "V" : row.resultCode === "E" ? "E" : "D"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
              <RecentMatchesTable title={match.homeTeam} matches={homeRecentMatches} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-slate-800">
                <TeamLink gender={gender} teamId={match.awayTeamId} teamName={match.awayTeam}>
                  {match.awayTeam}
                </TeamLink>
              </h3>
              <RecentMatchesTable title={match.awayTeam} matches={awayRecentMatches} />
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

      {video && <MatchVideoBlock video={video} />}
    </div>
  );
}
