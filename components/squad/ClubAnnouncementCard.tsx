"use client";

import { ArrowLeftRight, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/Badge";
import { NewsMedia } from "@/components/NewsMedia";
import { newsCategoryBadge } from "@/lib/noticias";
import { formatDate } from "@/lib/utils";
import type { ClubAnnouncementDisplay } from "@/lib/club-announcement";
import { clubAnnouncementNewsItem, clubAnnouncementHref } from "@/lib/club-announcement";

type ClubAnnouncementCardProps = {
  announcement: ClubAnnouncementDisplay;
};

const categoryIcons: Record<string, LucideIcon> = {
  fichajes: ArrowLeftRight,
};

export function ClubAnnouncementCard({ announcement }: ClubAnnouncementCardProps) {
  const newsItem = clubAnnouncementNewsItem(announcement);
  const href = clubAnnouncementHref(announcement);

  if (!newsItem || !href) return null;

  const category = newsCategoryBadge(newsItem);
  const CategoryIcon = categoryIcons[category.key] ?? Megaphone;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-[4.25rem] overflow-hidden rounded-xl border border-[#214C9B] bg-white sm:min-h-[8.5rem]"
    >
      <NewsMedia item={newsItem} variant="card" />
      <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:justify-between sm:p-5">
        <div>
          <h3 className="line-clamp-3 text-sm font-extrabold uppercase leading-snug text-[#214C9B] group-hover:underline sm:line-clamp-none sm:text-lg sm:leading-tight">
            {newsItem.title}
          </h3>
          <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-slate-800 sm:block sm:line-clamp-3">
            {newsItem.excerpt}
          </p>
        </div>
        <div className="mt-3 hidden flex-wrap items-center justify-between gap-2 sm:flex sm:mt-4">
          <span className="text-xs font-medium text-[#214C9B]/65">
            {formatDate(newsItem.date, { day: "numeric", month: "long" })} | {newsItem.source}
          </span>
          <Badge tone={category.tone} className="shrink-0 gap-1.5 px-3 py-1.5">
            <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
            {category.label}
          </Badge>
        </div>
      </div>
    </a>
  );
}

/** Vista previa sin enlace (solo texto legacy sin URL). */
export function ClubAnnouncementCardStatic({ announcement }: ClubAnnouncementCardProps) {
  const newsItem = clubAnnouncementNewsItem(announcement);
  if (!newsItem) return null;

  const category = newsCategoryBadge(newsItem);
  const CategoryIcon = categoryIcons[category.key] ?? Megaphone;

  return (
    <article className="flex min-h-[4.25rem] overflow-hidden rounded-xl border border-[#214C9B] bg-white sm:min-h-[8.5rem]">
      <NewsMedia item={newsItem} variant="card" />
      <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:justify-between sm:p-5">
        <div>
          <h3 className="line-clamp-3 text-sm font-extrabold uppercase leading-snug text-[#214C9B] sm:line-clamp-none sm:text-lg sm:leading-tight">
            {newsItem.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-800 sm:line-clamp-3">{newsItem.excerpt}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4">
          <span className="text-xs font-medium text-[#214C9B]/65">
            {formatDate(newsItem.date, { day: "numeric", month: "long" })} | {newsItem.source}
          </span>
          <Badge tone={category.tone} className="shrink-0 gap-1.5 px-3 py-1.5">
            <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
            {category.label}
          </Badge>
        </div>
      </div>
    </article>
  );
}

export function hasClubAnnouncementCard(announcement: ClubAnnouncementDisplay): boolean {
  return Boolean(clubAnnouncementNewsItem(announcement));
}

export function clubAnnouncementIsLinkable(announcement: ClubAnnouncementDisplay): boolean {
  return Boolean(clubAnnouncementHref(announcement));
}
