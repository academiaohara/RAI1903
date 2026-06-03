import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, MatchArticle } from "@/types";

const RAI_TEAM_IDS: Record<PrimerEquipoGender, string> = {
  masculino: "real-aviles-industrial",
  femenino: "real-aviles-industrial-femenino",
};

const PLACEHOLDER_CRONICA_EXCERPT = "Crónica pendiente de completar.";
const PLACEHOLDER_PREVIA_EXCERPT = "Previa pendiente de completar.";

function getRaiTeamId(gender: PrimerEquipoGender): string {
  return RAI_TEAM_IDS[gender];
}

export function matchArticleIdPrefix(gender: PrimerEquipoGender): string {
  return gender === "femenino" ? "fem-" : "";
}

export function defaultCronicaId(matchId: string, gender: PrimerEquipoGender = "masculino"): string {
  return `${matchArticleIdPrefix(gender)}cronica-${matchId}`;
}

/** @deprecated Usar defaultCronicaId: previa y crónica comparten la misma ficha. */
export function defaultPreviaId(matchId: string, gender: PrimerEquipoGender = "masculino"): string {
  return defaultCronicaId(matchId, gender);
}

export function matchIdFromCronicaArticleId(articleId: string, gender: PrimerEquipoGender = "masculino"): string | null {
  const prefix = `${matchArticleIdPrefix(gender)}cronica-`;
  if (!articleId.startsWith(prefix)) return null;
  return articleId.slice(prefix.length);
}

export function matchIdFromPreviaArticleId(articleId: string, gender: PrimerEquipoGender = "masculino"): string | null {
  const prefix = `${matchArticleIdPrefix(gender)}previa-`;
  if (!articleId.startsWith(prefix)) return null;
  return articleId.slice(prefix.length);
}

export function isLegacyPreviaArticleId(articleId: string, gender: PrimerEquipoGender = "masculino"): boolean {
  return matchIdFromPreviaArticleId(articleId, gender) !== null;
}

function matchArticleGroupKey(article: Pick<MatchArticle, "matchId" | "gender">): string {
  return `${article.matchId}:${article.gender}`;
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
    excerpt: PLACEHOLDER_CRONICA_EXCERPT,
    body: [],
  };
}

export function buildPlaceholderUpcomingMatch(match: Match, gender: PrimerEquipoGender): MatchArticle {
  return {
    id: defaultCronicaId(match.id, gender),
    matchId: match.id,
    gender,
    type: "cronica",
    title: `${match.homeTeam} vs ${match.awayTeam}`,
    date: match.date,
    source: gender === "femenino" ? "Fútbol Femenino Norte" : "AsturFutbol",
    excerpt: PLACEHOLDER_PREVIA_EXCERPT,
    body: [],
  };
}

/** @deprecated Usar buildPlaceholderUpcomingMatch. */
export function buildPlaceholderPrevia(match: Match, gender: PrimerEquipoGender): MatchArticle {
  return {
    ...buildPlaceholderUpcomingMatch(match, gender),
    id: `${matchArticleIdPrefix(gender)}previa-${match.id}`,
    type: "previa",
    title: `Previa: ${match.homeTeam} vs ${match.awayTeam}`,
  };
}

function mergePreviaIntoCronica(cronica: MatchArticle, previa: MatchArticle): MatchArticle {
  return {
    ...cronica,
    excerpt:
      (cronica.excerpt === PLACEHOLDER_CRONICA_EXCERPT || cronica.excerpt === PLACEHOLDER_PREVIA_EXCERPT) &&
      previa.excerpt &&
      previa.excerpt !== PLACEHOLDER_PREVIA_EXCERPT
        ? previa.excerpt
        : cronica.excerpt || previa.excerpt,
    body: cronica.body.length > 0 ? cronica.body : previa.body,
    clubNewsId: cronica.clubNewsId ?? previa.clubNewsId,
    source: cronica.source === "RAI1903" && previa.source !== "RAI1903" ? previa.source : cronica.source,
  };
}

function previaArticleToCronica(previa: MatchArticle): MatchArticle {
  return {
    ...previa,
    id: defaultCronicaId(previa.matchId, previa.gender),
    type: "cronica",
    title: previa.title.replace(/^Previa:\s*/i, ""),
  };
}

/** Fusiona previas legacy en una única ficha por partido (tipo crónica). */
export function normalizeMatchArticles(articles: MatchArticle[]): MatchArticle[] {
  const groups = new Map<string, MatchArticle[]>();

  for (const article of articles) {
    const key = matchArticleGroupKey(article);
    const group = groups.get(key) ?? [];
    group.push(article);
    groups.set(key, group);
  }

  const normalized: MatchArticle[] = [];
  const consumed = new Set<string>();

  for (const group of groups.values()) {
    const cronica = group.find((article) => article.type === "cronica");
    const previa = group.find((article) => article.type === "previa");

    if (cronica && previa) {
      normalized.push(mergePreviaIntoCronica(cronica, previa));
      consumed.add(cronica.id);
      consumed.add(previa.id);
      continue;
    }

    if (cronica) {
      normalized.push(cronica);
      consumed.add(cronica.id);
      continue;
    }

    if (previa) {
      const converted = previaArticleToCronica(previa);
      normalized.push(converted);
      consumed.add(previa.id);
    }
  }

  for (const article of articles) {
    if (!consumed.has(article.id)) normalized.push(article);
  }

  return normalized;
}

/** Garantiza una ficha por partido del Avilés (el CMS puede sobrescribir). */
export function ensureAvilesMatchArticles(
  existing: MatchArticle[],
  matches: Match[],
  gender: PrimerEquipoGender,
): MatchArticle[] {
  const raiId = getRaiTeamId(gender);
  const avilesMatches = matches.filter(
    (match) => match.homeTeamId === raiId || match.awayTeamId === raiId,
  );

  const normalized = normalizeMatchArticles(existing);
  const byMatch = new Map(normalized.map((article) => [matchArticleGroupKey(article), article]));
  const merged = [...normalized];

  for (const match of avilesMatches) {
    const key = matchArticleGroupKey({ matchId: match.id, gender });
    if (byMatch.has(key)) continue;

    const article =
      match.status === "finished"
        ? buildPlaceholderCronica(match, gender)
        : buildPlaceholderUpcomingMatch(match, gender);
    merged.push(article);
    byMatch.set(key, article);
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

  return avilesMatches.map((match) => {
    const rival = match.awayTeamId === clubTeamId ? match.homeTeam : match.awayTeam;

    if (match.status === "finished") {
      return {
        ...buildPlaceholderCronica(match, gender),
        id: `${idPrefix}cronica-${match.id}`,
        excerpt: `Resumen de la jornada ${match.matchday} con lectura táctica, protagonistas y sensaciones del vestuario blanquiazul.`,
      };
    }

    return {
      ...buildPlaceholderUpcomingMatch(match, gender),
      id: `${idPrefix}cronica-${match.id}`,
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
              `El Real Avilés Industrial afronta la jornada ${match.matchday} ante ${rival}.`,
              "El cuerpo técnico llega con la plantilla casi completa y rotaciones pensadas para sostener el ritmo competitivo.",
              "La clave pasará por dominar los duelos en campo abierto y aprovechar las acciones a balón parado.",
              "El Román Suárez Puerta busca otro ambiente exigente para empujar al equipo en un tramo decisivo de la liga.",
            ],
    };
  });
}