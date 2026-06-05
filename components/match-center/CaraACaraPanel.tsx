import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { getTeamCrestById } from "@/lib/team-crests";
import { getTeamByGender } from "@/lib/fixtures";
import { cn, resultTone } from "@/lib/utils";
import type { CaraACaraData } from "@/lib/cara-a-cara";
import type { FormCode } from "@/types";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

function FormRacha({ form }: { form: FormCode[] }) {
  const label: Record<FormCode, string> = { G: "V", E: "E", P: "D" };
  const padded: FormCode[] =
    form.length >= 3 ? form.slice(-3) : ([...Array<FormCode>(3 - form.length).fill("E"), ...form] as FormCode[]);

  return (
    <div className="flex justify-center gap-1">
      {padded.map((code, index) => (
        <span
          key={`${code}-${index}`}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded text-[10px] font-extrabold text-white",
            resultTone(code),
          )}
          title={code === "G" ? "Victoria" : code === "E" ? "Empate" : "Derrota"}
        >
          {label[code]}
        </span>
      ))}
    </div>
  );
}

function TeamHeader({
  side,
  gender,
  align,
}: {
  side: CaraACaraData["home"];
  gender: PrimerEquipoGender;
  align: "left" | "right";
}) {
  const mockTeam = getTeamByGender(side.teamId, gender);
  const crest = getTeamCrestById(
    side.teamId,
    mockTeam?.crestInitials ?? side.teamName.slice(0, 3).toUpperCase(),
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-2", align === "right" && "flex-row-reverse text-right")}>
      <OpponentCrest logo={crest} opponent={side.teamName} size="sm" />
      <TeamLink
        gender={gender}
        teamId={side.teamId}
        teamName={side.teamName}
        className="min-w-0 text-xs font-extrabold uppercase leading-tight text-slate-800"
      >
        {side.teamName}
      </TeamLink>
    </div>
  );
}

function StatRow({
  label,
  homeValue,
  awayValue,
}: {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
}) {
  return (
    <div className="grid grid-cols-[1fr_minmax(6.5rem,auto)_1fr] items-center gap-2 border-b border-slate-100 py-2.5 last:border-b-0">
      <p className="text-right text-base font-extrabold tabular-nums text-[#981915] sm:text-lg">{homeValue}</p>
      <p className="text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</p>
      <p className="text-left text-base font-extrabold tabular-nums text-[#214C9B] sm:text-lg">{awayValue}</p>
    </div>
  );
}

export function CaraACaraPanel({ data, gender }: { data: CaraACaraData; gender: PrimerEquipoGender }) {
  const { home, away } = data;

  return (
    <section className="rounded-2xl border border-[#214C9B]/15 bg-slate-50/60 p-4 sm:p-5">
      <h2 className="text-center text-sm font-extrabold uppercase tracking-normal text-[#214C9B]">Cara a cara</h2>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamHeader side={home} gender={gender} align="left" />
        <span className="text-xs font-bold uppercase text-slate-400">vs</span>
        <TeamHeader side={away} gender={gender} align="right" />
      </div>

      <div className="mt-4 border-t border-[#214C9B]/10 pt-2">
        <StatRow
          label="Clasificación"
          homeValue={home.played > 0 ? `${home.position}º` : "—"}
          awayValue={away.played > 0 ? `${away.position}º` : "—"}
        />
        <StatRow label="Puntos" homeValue={home.points} awayValue={away.points} />
        <StatRow label="Goles a favor" homeValue={home.goalsFor} awayValue={away.goalsFor} />
        <StatRow label="Goles en contra" homeValue={home.goalsAgainst} awayValue={away.goalsAgainst} />
      </div>

      <div className="mt-4 border-t border-[#214C9B]/10 pt-4">
        <p className="text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">Racha (últimos 3)</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <FormRacha form={home.form} />
          <FormRacha form={away.form} />
        </div>
      </div>
    </section>
  );
}
