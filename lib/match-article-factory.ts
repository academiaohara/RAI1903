import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, MatchArticle } from "@/types";

const RAI_TEAM_IDS: Record<PrimerEquipoGender, string> = {
  masculino: "real-aviles-industrial",
  femenino: "real-aviles-industrial-femenino",
};

function getRaiTeamId(gender: PrimerEquipoGender): string {
  return RAI_TEAM_IDS[gender];
}

export function matchArticleIdPrefix(gender: PrimerEquipoGender): string {
  return gender === "femenino" ? "fem-" : "";
}

export function defaultCronicaId(matchId: string, gender: PrimerEquipoGender = "masculino"): string {
  return `${matchArticleIdPrefix(gender)}cronica-${matchId}`;
}

export function defaultPreviaId(matchId: string, gender: PrimerEquipoGender = "masculino"): string {
  return `${matchArticleIdPrefix(gender)}previa-${matchId}`;
}

function articleKey(article: Pick<MatchArticle, "type" | "matchId" | "gender">): string {
  return `${article.type}:${article.matchId}:${article.gender}`;
}

export function buildPlaceholderCronica(match: Match, gender: PrimerEquipoGender): MatchArticle {
  const score =
    match.homeScore !== undefined && match.awayScore !== undefined
      ? `${match.homeScore}-${match.awayScore}`
      : "—";

  return {
    id: defaultCronicaId(match.id, gender),
    matchId: match.id,
    gender,
    type: "cronica",
    title: `Crónica: ${match.homeTeam} ${score} ${match.awayTeam}`,
    date: match.date,
    source: "RAI1903",
    excerpt: "Crónica pendiente de completar.",
    body: [],
  };
}

export function buildPlaceholderPrevia(match: Match, gender: PrimerEquipoGender): MatchArticle {
  return {
    id: defaultPreviaId(match.id, gender),
    matchId: match.id,
    gender,
    type: "previa",
    title: `Previa: ${match.homeTeam} vs ${match.awayTeam}`,
    date: match.date,
    source: gender === "femenino" ? "Fútbol Femenino Norte" : "AsturFutbol",
    excerpt: "Previa pendiente de completar.",
    body: [],
  };
}

/** Garantiza una crónica o previa por partido del Avilés (el CMS puede sobrescribir). */
export function ensureAvilesMatchArticles(
  existing: MatchArticle[],
  matches: Match[],
  gender: PrimerEquipoGender,
): MatchArticle[] {
  const raiId = getRaiTeamId(gender);
  const avilesMatches = matches.filter(
    (match) => match.homeTeamId === raiId || match.awayTeamId === raiId,
  );

  const byKey = new Map(existing.map((article) => [articleKey(article), article]));
  const merged = [...existing];

  for (const match of avilesMatches) {
    if (match.status === "finished") {
      const key = `cronica:${match.id}:${gender}`;
      if (!byKey.has(key)) {
        const article = buildPlaceholderCronica(match, gender);
        merged.push(article);
        byKey.set(key, article);
      }
    } else {
      const key = `previa:${match.id}:${gender}`;
      if (!byKey.has(key)) {
        const article = buildPlaceholderPrevia(match, gender);
        merged.push(article);
        byKey.set(key, article);
      }
    }
  }

  return merged;
}

export function buildMatchArticlesForClub(
  matches: Match[],
  clubTeamId: string,
  gender: PrimerEquipoGender,
  idPrefix = matchArticleIdPrefix(gender),
): MatchArticle[] {
  const avilesMatches = matches.filter(
    (match) => match.homeTeamId === clubTeamId || match.awayTeamId === clubTeamId,
  );
  const finished = avilesMatches.filter((match) => match.status === "finished");
  const scheduled = avilesMatches.filter((match) => match.status === "scheduled");

  const cronicas: MatchArticle[] = finished.map((match) => ({
    ...buildPlaceholderCronica(match, gender),
    id: `${idPrefix}cronica-${match.id}`,
    excerpt: `Resumen de la jornada ${match.matchday} con lectura táctica, protagonistas y sensaciones del vestuario blanquiazul.`,
  }));

  const previas: MatchArticle[] = scheduled.map((match) => ({
    ...buildPlaceholderPrevia(match, gender),
    id: `${idPrefix}previa-${match.id}`,
    excerpt:
      gender === "femenino"
        ? `Análisis femenino de la jornada ${match.matchday} con estado de forma y convocatoria.`
        : `Análisis del duelo de la jornada ${match.matchday}: forma reciente, claves tácticas y estado de la plantilla.`,
    body:
      gender === "femenino"
        ? [
            `El Avilés Femenino afronta la jornada ${match.matchday} con ambición de sumar en la parte alta de la tabla.`,
            "Laura Menéndez cuenta con la base titular y rotaciones para mantener la intensidad.",
            "La clave será el duelo en bandas y la capacidad de cerrar el partido desde balón parado.",
          ]
        : [
            `El Real Avilés Industrial afronta la jornada ${match.matchday} ante ${match.awayTeamId === clubTeamId ? match.homeTeam : match.awayTeam}.`,
            "El cuerpo técnico llega con la plantilla casi completa y rotaciones pensadas para sostener el ritmo competitivo.",
            "La clave pasará por dominar los duelos en campo abierto y aprovechar las acciones a balón parado.",
            "El Román Suárez Puerta busca otro ambiente exigente para empujar al equipo en un tramo decisivo de la liga.",
          ],
  }));

  return [...cronicas, ...previas];
}
