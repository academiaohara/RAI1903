import type { Route } from "next";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { NewsChannel, NewsItem } from "@/types";

export const NOTICIAS_TABS: { href: Route; label: string }[] = [
  { href: "/noticias/club", label: "Club" },
  { href: "/noticias/prensa", label: "Prensa" },
];

export const sortNewsByDate = <T extends { date: string; id: string }>(items: T[]) =>
  [...items].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

export const newsByChannel = <T extends { channel: NewsChannel; date: string; id: string }>(
  items: T[],
  channel: NewsChannel,
) => sortNewsByDate(items.filter((item) => item.channel === channel));

export const newsAppliesToTeam = (item: Pick<NewsItem, "teams">, gender: PrimerEquipoGender) =>
  !item.teams || item.teams.length === 0 || item.teams.includes(gender);

export const newsForTeam = (items: NewsItem[], gender: PrimerEquipoGender) =>
  sortNewsByDate(items.filter((item) => newsAppliesToTeam(item, gender)));

export const teamScopeLabel = (teams: PrimerEquipoGender[] | undefined) => {
  if (!teams || teams.length === 0) return null;
  if (teams.length === 2) return "Primer equipo";
  return genderLabels[teams[0]!].title;
};

export const RAI_BRAND_BLUE = "#214C9B";
export const RAI_LOGO_PATH = "/rai_logo.webp";
const REAL_AVILES_CLUB_SITE = "realavilesindustrial1903.com";

export const isRealAvilesClubSiteNews = (item: { url: string }) =>
  item.url.includes(REAL_AVILES_CLUB_SITE);

/** Fallback visual cuando no hay og:image ni foto en la nota del club. */
export const shouldUseRaiLogoNewsFallback = (item: { url: string; imageUrl?: string }) =>
  !item.imageUrl && isRealAvilesClubSiteNews(item);
