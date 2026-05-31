import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { getTeamCrest } from "@/lib/team-crests";
import { MatchNewsCarousel } from "@/components/match-center/MatchNewsCarousel";
import { MatchVideoBlock } from "@/components/match-center/MatchVideoBlock";
import { getTeamByGender } from "@/lib/fixtures";
import { cn, resultTone } from "@/lib/utils";
import type { FormCode, HeadToHeadEntry, MatchAvailability, MatchDetail, MatchVideo, RecentFormMatch } from "@/types";

function FormBadges({ form }: { form: FormCode[] }) {
  const label: Record<FormCode, string> = { G: "V", E: "E", P: "D" };
  return (
    <div className="flex gap-1">
      {form.map((code, index) => (
        <span
          key={`${code}-${index}`}
          className={cn("flex h-7 w-7 items-center justify-center rounded-md text-xs font-extrabold", resultTone(code))}
          title={code === "G" ? "Victoria" : code === "E" ? "Empate" : "Derrota"}
        >
          {label[code]}
        </span>
      ))}
    </div>
  );
}

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
      <table className="w-full min-w-[28rem] text-left text-sm">
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
              <td className="py-2 pr-2 font-semibold text-slate-600">{row.date}</td>
              <td className="py-2 pr-2 font-semibold text-slate-800">{row.homeTeam}</td>
              <td className="py-2 pr-2 font-extrabold text-[#214C9B]">{row.score}</td>
              <td className="py-2 pr-2 font-semibold text-slate-800">{row.awayTeam}</td>
              <td className="py-2 pr-2 text-slate-500">{row.competition}</td>
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

function H2HTable({ entries }: { entries: HeadToHeadEntry[] }) {
  if (entries.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">Sin historial de enfrentamientos registrado.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm">
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
          {entries.map((row) => (
            <tr key={`${row.date}-${row.score}`} className="border-b border-slate-100">
              <td className="py-2 pr-2 font-semibold text-slate-600">{row.date}</td>
              <td className="py-2 pr-2">{row.homeTeam}</td>
              <td className="py-2 pr-2 font-extrabold text-[#214C9B]">{row.score}</td>
              <td className="py-2 pr-2">{row.awayTeam}</td>
              <td className="py-2 pr-2 text-slate-500">{row.competition}</td>
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

function AvailabilityBlock({ availability, homeLabel, awayLabel }: { availability: MatchAvailability; homeLabel: string; awayLabel: string }) {
  const renderList = (players: MatchAvailability["home"], label: string) => (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4">
      <h4 className="text-sm font-extrabold uppercase text-[#214C9B]">{label}</h4>
      {players.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Sin bajas confirmadas.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {players.map((player) => (
            <li key={`${label}-${player.name}`} className="text-sm">
              <span className="font-bold text-slate-800">{player.name}</span>{" "}
              <span className="text-xs font-bold uppercase text-[#981915]">({player.reason})</span>
              <p className="text-xs text-slate-500">{player.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold uppercase tracking-normal text-[#214C9B]">Sancionados y lesionados</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {renderList(availability.home, homeLabel)}
        {renderList(availability.away, awayLabel)}
      </div>
    </div>
  );
}

export function MatchPreviaPanel({
  detail,
  compact = false,
  rdpVideo,
  showH2H = true,
}: {
  detail: MatchDetail;
  compact?: boolean;
  rdpVideo?: MatchVideo | null;
  showH2H?: boolean;
}) {
  const { match, gender, homeRecentMatches, awayRecentMatches, headToHead, h2hSummary, availability, pressNews } = detail;
  const homeTeam = getTeamByGender(match.homeTeamId, gender);
  const awayTeam = getTeamByGender(match.awayTeamId, gender);
  const video = rdpVideo ?? detail.rdpPrevia;

  return (
    <div className="space-y-8">
      {!compact && showH2H && (
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Cara a cara y estado de forma</h2>
          <div className="rounded-2xl border border-[#214C9B]/15 bg-slate-50 p-4 sm:p-6">
            <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <TeamLink gender={gender} teamId={match.homeTeamId} teamName={match.homeTeam} className="flex flex-col items-center gap-2">
                  <OpponentCrest logo={homeTeam ? getTeamCrest(homeTeam) : "LOC"} opponent={match.homeTeam} size="md" />
                  <span className="text-sm font-extrabold text-slate-800">{match.homeTeam}</span>
                </TeamLink>
                {homeTeam && <FormBadges form={homeTeam.form} />}
              </div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase text-slate-500">Ultimos 6 H2H</p>
                <p className="mt-1 text-lg font-extrabold text-[#214C9B]">
                  {h2hSummary.wins}V {h2hSummary.draws}E {h2hSummary.losses}D
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <TeamLink gender={gender} teamId={match.awayTeamId} teamName={match.awayTeam} className="flex flex-col items-center gap-2">
                  <OpponentCrest logo={awayTeam ? getTeamCrest(awayTeam) : "VIS"} opponent={match.awayTeam} size="md" />
                  <span className="text-sm font-extrabold text-slate-800">{match.awayTeam}</span>
                </TeamLink>
                {awayTeam && <FormBadges form={awayTeam.form} />}
              </div>
            </div>
          </div>
          <H2HTable entries={headToHead} />
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

      {!compact && <AvailabilityBlock availability={availability} homeLabel={match.homeTeam} awayLabel={match.awayTeam} />}

      {video && <MatchVideoBlock video={video} />}

      <MatchNewsCarousel items={pressNews} title="Pre partido en medios" />
    </div>
  );
}
