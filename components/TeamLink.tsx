import Link from "next/link";
import type { ReactNode } from "react";
import { canLinkEquipoLiga, equipoLigaHref } from "@/lib/equipo-liga";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { cn } from "@/lib/utils";

type TeamLinkProps = {
  gender: PrimerEquipoGender;
  teamId: string;
  teamName: string;
  children: ReactNode;
  className?: string;
};

export const linkHoverClass =
  "underline decoration-[#214C9B]/30 underline-offset-2 transition hover:text-[#214C9B] hover:decoration-[#214C9B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]";

/** Misma interacción que `linkHoverClass`, legible sobre fondo azul del marcador. */
export const headerLinkHoverClass =
  "underline decoration-white/30 underline-offset-2 transition hover:text-white hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function TeamLink({ gender, teamId, teamName, children, className }: TeamLinkProps) {
  const season = useSeasonOptional();
  if (!canLinkEquipoLiga(gender, teamId, season?.bundles)) {
    return <span className={className}>{children}</span>;
  }

  const href = equipoLigaHref(gender, teamId);

  return (
    <Link href={href} className={cn(linkHoverClass, className)} aria-label={`Ver ficha de ${teamName}`}>
      {children}
    </Link>
  );
}

type MatchTeamLinkProps = {
  gender?: PrimerEquipoGender;
  teamId: string;
  teamName: string;
  highlighted?: boolean;
  align?: "left" | "right";
  className?: string;
};

export function MatchTeamLink({
  gender = "masculino",
  teamId,
  teamName,
  highlighted = false,
  align = "left",
  className,
}: MatchTeamLinkProps) {
  const tone = highlighted ? "text-[#214C9B]" : "text-slate-700";
  const base = cn(
    "min-w-0 break-words text-sm font-extrabold leading-snug",
    align === "right" && "text-right",
    tone,
    className,
  );

  return (
    <TeamLink gender={gender} teamId={teamId} teamName={teamName} className={base}>
      {teamName}
    </TeamLink>
  );
}
