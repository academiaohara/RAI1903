import type { MatchLineup } from "@/types";

function LineupColumn({ title, lineup }: { title: string; lineup: MatchLineup }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 p-4">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-extrabold uppercase text-[#214C9B]" title={title}>
          {title}
        </h3>
        <span className="shrink-0 text-xs font-bold text-slate-500">{lineup.formation}</span>
      </div>
      <p className="mt-3 text-xs font-bold uppercase text-slate-500">Titulares</p>
      <ul className="mt-2 space-y-1">
        {lineup.starters.map((player) => (
          <li key={`${player.number}-${player.name}`} className="flex min-w-0 items-center gap-2 text-sm text-slate-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#214C9B] text-xs font-extrabold text-white">{player.number}</span>
            <span className="min-w-0 truncate font-semibold" title={player.name}>
              {player.name}
            </span>
          </li>
        ))}
      </ul>
      {lineup.bench.length > 0 && (
        <>
          <p className="mt-4 text-xs font-bold uppercase text-slate-500">Suplentes</p>
          <ul className="mt-2 space-y-1">
            {lineup.bench.map((player) => (
              <li key={`b-${player.number}-${player.name}`} className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#214C9B]/25 text-xs font-bold text-[#214C9B]">
                  {player.number}
                </span>
                <span className="min-w-0 truncate" title={player.name}>
                  {player.name}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function MatchLineupsPanel({
  homeLabel,
  awayLabel,
  homeLineup,
  awayLineup,
}: {
  homeLabel: string;
  awayLabel: string;
  homeLineup: MatchLineup;
  awayLineup: MatchLineup;
}) {
  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Alineaciones</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <LineupColumn title={homeLabel} lineup={homeLineup} />
        <LineupColumn title={awayLabel} lineup={awayLineup} />
      </div>
    </section>
  );
}
