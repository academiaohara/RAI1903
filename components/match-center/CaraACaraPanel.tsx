import Image from "next/image";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { getTeamCrest } from "@/lib/team-crests";
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
    <div className="flex justify-center gap-1.5">
      {padded.map((code, index) => (
        <span
          key={`${code}-${index}`}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-xs font-extrabold text-white",
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

function SidePortrait({
  side,
  gender,
}: {
  side: CaraACaraData["home"];
  gender: PrimerEquipoGender;
}) {
  const team = getTeamByGender(side.teamId, gender);
  const isHomeAccent = side.accent === "home";
  const bg = isHomeAccent ? "bg-[#981915]" : "bg-[#214C9B]";

  return (
    <div className={cn("relative flex min-h-[220px] flex-col items-center justify-end overflow-hidden sm:min-h-[280px]", bg)}>
      {side.featuredPlayerPhoto ? (
        <Image
          src={side.featuredPlayerPhoto}
          alt={side.featuredPlayerName ?? side.teamName}
          fill
          className="object-cover object-top opacity-95"
          sizes="(max-width: 768px) 33vw, 220px"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <OpponentCrest
            logo={team ? getTeamCrest(team) : side.teamId.slice(0, 3).toUpperCase()}
            opponent={side.teamName}
            size="lg"
          />
        </div>
      )}
      <div className="relative z-10 w-full bg-gradient-to-t from-black/55 to-transparent px-3 pb-4 pt-10">
        <TeamLink
          gender={gender}
          teamId={side.teamId}
          teamName={side.teamName}
          className="block text-center text-xs font-extrabold uppercase leading-tight text-white"
        >
          {side.teamName}
        </TeamLink>
        {side.featuredPlayerName && (
          <p className="mt-1 text-center text-[10px] font-semibold text-white/85">{side.featuredPlayerName}</p>
        )}
      </div>
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
    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch border-b border-black/10 last:border-b-0">
      <div className="flex items-center justify-center bg-[#981915]/10 px-2 py-3 text-center text-lg font-extrabold tabular-nums text-[#981915] sm:text-xl">
        {homeValue}
      </div>
      <div className="flex min-w-[7.5rem] items-center justify-center bg-black px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-white sm:min-w-[8.5rem] sm:text-xs">
        {label}
      </div>
      <div className="flex items-center justify-center bg-[#214C9B]/10 px-2 py-3 text-center text-lg font-extrabold tabular-nums text-[#214C9B] sm:text-xl">
        {awayValue}
      </div>
    </div>
  );
}

export function CaraACaraPanel({ data, gender }: { data: CaraACaraData; gender: PrimerEquipoGender }) {
  const { home, away } = data;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        <SidePortrait side={home} gender={gender} />

        <div className="flex flex-col bg-white">
          <div className="border-b border-[#214C9B]/10 px-4 py-5 text-center">
            <h2 className="font-display text-2xl font-extrabold italic tracking-tight text-[#214C9B] sm:text-3xl">
              Cara a Cara
            </h2>
          </div>

          <div className="flex-1">
            <StatRow label="Clasificación" homeValue={`${home.position}º`} awayValue={`${away.position}º`} />
            <StatRow label="Puntos" homeValue={home.points} awayValue={away.points} />
            <StatRow label="Goles a favor" homeValue={home.goalsFor} awayValue={away.goalsFor} />
            <StatRow label="Goles en contra" homeValue={home.goalsAgainst} awayValue={away.goalsAgainst} />
          </div>

          <div className="border-t border-[#214C9B]/10 bg-slate-50 px-4 py-4">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Racha</p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <FormRacha form={home.form} />
              <FormRacha form={away.form} />
            </div>
          </div>
        </div>

        <SidePortrait side={away} gender={gender} />
      </div>
    </section>
  );
}
