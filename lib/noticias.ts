import type { Route } from "next";
import type { NewsChannel } from "@/types";

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
