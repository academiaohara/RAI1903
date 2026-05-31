import type { Route } from "next";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { NewsChannel, NewsItem, NewsTag } from "@/types";

export const newsTagLabels: Record<NewsTag, string> = {
  partido: "Partido",
  fichajes: "Fichajes",
  cantera: "Cantera",
  previa: "Previa",
  cronica: "Crónica",
  club: "Club",
  lesionados: "Lesionados",
  rumores: "Rumores",
  renovaciones: "Renovaciones",
  entrevistas: "Entrevistas",
  otros: "Otros",
};

const categoryPriority: NewsTag[] = ["fichajes", "lesionados", "rumores", "renovaciones", "entrevistas", "cantera", "partido", "previa", "cronica", "club", "otros"];

export const newsCategoryBadge = (item: Pick<NewsItem, "channel" | "tags">) => {
  const primaryTag = categoryPriority.find((tag) => item.tags.includes(tag));

  if (primaryTag === "fichajes") {
    return { key: "fichajes", label: newsTagLabels.fichajes, tone: "green" as const };
  }

  if (primaryTag) {
    return { key: primaryTag, label: newsTagLabels[primaryTag], tone: "blue" as const };
  }

  return {
    key: item.channel === "club" ? "club" : "noticia",
    label: item.channel === "club" ? "Club" : "Noticia",
    tone: "blue" as const,
  };
};

export const NOTICIAS_TABS: { href: Route; label: string }[] = [
  { href: "/noticias/club", label: "Club" },
  { href: "/noticias/prensa", label: "Prensa" },
];

export const sortNewsByDate = <T extends { date: string; id: string }>(items: T[]) =>
  [...items].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

/** Máximo de noticias en el carrusel animado de inicio y fichas. */
export const NEWS_TICKER_LIMIT = 10;

export const newsByChannel = <T extends { channel: NewsChannel; date: string; id: string }>(
  items: T[],
  channel: NewsChannel,
) => sortNewsByDate(items.filter((item) => item.channel === channel));

/** Sin etiqueta de equipo: noticia general (masculino y femenino). */
export const isGeneralNewsTeamScope = (teams: PrimerEquipoGender[] | undefined) =>
  !teams || teams.length === 0;

export const newsAppliesToTeam = (item: Pick<NewsItem, "teams">, gender: PrimerEquipoGender) => {
  const teams = item.teams;
  if (isGeneralNewsTeamScope(teams)) return true;
  return teams!.includes(gender);
};

export const newsForTeam = (items: NewsItem[], gender: PrimerEquipoGender) =>
  sortNewsByDate(items.filter((item) => newsAppliesToTeam(item, gender)));

export const teamScopeLabel = (teams: PrimerEquipoGender[] | undefined) => {
  if (!teams || teams.length === 0) return null;
  if (teams.length === 2) return "Primer equipo";
  return genderLabels[teams[0]!].title;
};

export type TeamScopeBadgeTone = "masculino" | "femenino";

export const teamScopeBadgeTone = (teams: PrimerEquipoGender[] | undefined): TeamScopeBadgeTone | null => {
  if (!teams || teams.length === 0) return null;
  if (teams.length === 2) return "masculino";
  return teams[0] === "femenino" ? "femenino" : "masculino";
};

/** Evita duplicar "Femenino" cuando la fuente ya lo indica (p. ej. Real Avilés Industrial Femenino). */
export const shouldShowTeamScopeBadge = (item: Pick<NewsItem, "teams" | "source">) => {
  const label = teamScopeLabel(item.teams);
  if (!label) return false;
  if (item.teams?.length === 1 && item.teams[0] === "femenino") {
    return !item.source.toLowerCase().includes("femenino");
  }
  return true;
};

export const RAI_BRAND_BLUE = "#214C9B";
export const RAI_BRAND_GRANATE = "#981915";
export const RAI_LOGO_PATH = "/rai_logo.webp";

export const raiNewsMediaBgClass = (teams: PrimerEquipoGender[] | undefined) =>
  teams?.length === 1 && teams[0] === "femenino" ? "bg-[#981915]" : "bg-[#214C9B]";

export const raiNewsFallbackBgClass = raiNewsMediaBgClass;
const REAL_AVILES_CLUB_SITE = "realavilesindustrial1903.com";

export const isRealAvilesClubSiteNews = (item: { url: string }) =>
  item.url.includes(REAL_AVILES_CLUB_SITE);

/** Noticias del club (canal o web oficial) que usan el escudo RAI si no hay imagen válida. */
export const raiLogoNewsFallbackEligible = (item: Pick<NewsItem, "url" | "channel">) =>
  isRealAvilesClubSiteNews(item) || item.channel === "club";

/** Fallback visual cuando no hay og:image ni foto en la nota del club. */
export const shouldUseRaiLogoNewsFallback = (item: Pick<NewsItem, "url" | "imageUrl" | "channel">) =>
  !item.imageUrl && raiLogoNewsFallbackEligible(item);

/** Hosts que devuelven 403 al optimizador de Next.js; el navegador debe cargar la URL directa. */
const UNOPTIMIZED_NEWS_IMAGE_HOSTS = new Set(["www.rtpa.es"]);

export const newsImageRequiresUnoptimized = (imageUrl: string) => {
  try {
    return UNOPTIMIZED_NEWS_IMAGE_HOSTS.has(new URL(imageUrl).hostname);
  } catch {
    return false;
  }
};
