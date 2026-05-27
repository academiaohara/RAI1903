import type { Route } from "next";
import type { NewsChannel } from "@/types";

export const NOTICIAS_TABS: { href: Route; label: string }[] = [
  { href: "/noticias/club", label: "Club" },
  { href: "/noticias/prensa", label: "Prensa" },
];

export const newsByChannel = <T extends { channel: NewsChannel }>(items: T[], channel: NewsChannel) =>
  items.filter((item) => item.channel === channel);
